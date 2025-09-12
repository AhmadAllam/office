// تحويل كامل من ملفات Access XML داخل ./data إلى نسخة احتياطية كاملة JSON
// الناتج: lawyers-backup-access.json في جذر المشروع

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outPath = path.join(root, 'lawyers-backup-access.json');

function readUtf8(p) {
  return fs.readFileSync(p, 'utf8');
}

function extractBlocks(xml, tag) {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g');
  const out = [];
  let m;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

function pickTag(block, tag) {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
  const m = re.exec(block);
  return m ? m[1].trim() : '';
}

function toInt(v) {
  if (v === undefined || v === null) return null;
  const n = parseInt(String(v).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

function safeStr(v) {
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

function toDateOnly(dtStr) {
  const s = safeStr(dtStr);
  if (!s) return '';
  const t = s.split('T')[0];
  return t || '';
}

// استخراج رقم الحصر وسنته من نص القرار
function extractInventoryFromDecision(decision, fallbackYear) {
  const text = safeStr(decision);
  if (!text) return { number: null, year: fallbackYear ?? null };

  // نمط: "حصر 12642لسنة 2024" أو مع فواصل: "حصر 12781,12782لسنة 2025"
  const withYear = text.match(/حصر\s*([0-9]+(?:[،,][0-9]+)*)\s*لسنة\s*([0-9]{4})/);
  if (withYear) {
    const nums = withYear[1].split(/[،,]/).map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n));
    const year = parseInt(withYear[2], 10);
    if (nums.length > 0) return { number: nums[0], year };
  }

  // نمط بدون سنة صريحة: "حصر 2109حبس" -> نستخدم سنة تاريخ الجلسة كبديل
  const onlyNumber = text.match(/حصر\s*([0-9]+)/);
  if (onlyNumber) {
    const num = parseInt(onlyNumber[1], 10);
    return { number: Number.isFinite(num) ? num : null, year: fallbackYear ?? null };
  }

  return { number: null, year: fallbackYear ?? null };
}

function build(customDataDir = null) {
  // تحديد مجلد البيانات
  let dataDir;
  if (customDataDir) {
    dataDir = path.resolve(customDataDir);
  } else {
    // إذا لم يتم تحديد مجلد، استخدم مجلد data (للتوافق مع النسخة القديمة)
    dataDir = path.join(root, 'data');
  }
  
  const FILES = {
    clients: path.join(dataDir, 'جدول الموكلين.xml'),
    opponents: path.join(dataDir, 'جدول الخصوم.xml'),
    cases: path.join(dataDir, 'جدول الدعاوى.xml'),
    sessions: path.join(dataDir, 'جدول الجلسات.xml'),
  };
  
  // تحقق من وجود الملفات
  for (const [k, p] of Object.entries(FILES)) {
    if (!fs.existsSync(p)) {
      throw new Error(`ملف مفقود: ${p}`);
    }
  }

  // 1) الموكلين
  const clientsXml = readUtf8(FILES.clients);
  const clientBlocks = extractBlocks(clientsXml, 'جدول_x0020_الموكلين');
  let clients = clientBlocks.map((blk) => {
    const id = toInt(pickTag(blk, 'معرف_x0020_الموكل'));
    const name = safeStr(pickTag(blk, 'اسم_x0020_الموكل'));
    return {
      id: id ?? undefined,
      name,
      capacity: 'بصفته الشخصية',
      address: '',
      phone: '',
    };
  }).filter(c => c.id != null && c.name !== '');

  // 2) الخصوم + خريطة ربط الخصم -> الموكل
  const opponentsXml = readUtf8(FILES.opponents);
  const opponentBlocks = extractBlocks(opponentsXml, 'جدول_x0020_الخصوم');
  const opponentClientMap = new Map(); // opponentId -> clientId
  const clientOverlayMap = new Map(); // clientId -> { capacity, address, phone }
  const opponents = opponentBlocks.map((blk) => {
    const id = toInt(pickTag(blk, 'معرف_x0020_الخصم'));
    const name = safeStr(pickTag(blk, 'اسم_x0020_الخصم'));
    const capacity = safeStr(pickTag(blk, 'صفة_x0020_الخصم'));
    const address = safeStr(pickTag(blk, 'عنوان_x0020_الخصم'));
    const phone = safeStr(pickTag(blk, 'هاتف_x0020_الخصم'));
    const clientId = toInt(pickTag(blk, 'معرف_x0020_الموكل'));
    // تجميع بيانات الموكل من سجل الخصم (عنوان/هاتف/صفة الموكل) مع بديل من حقول الخصم
    const clientCapacity = safeStr(pickTag(blk, 'صفة_x0020_الموكل'));
    const clientAddress = safeStr(pickTag(blk, 'عنوان_x0020_الموكل'));
    const clientPhone = safeStr(pickTag(blk, 'هاتف_x0020_الموكل'));
    if (id != null && clientId != null) opponentClientMap.set(id, clientId);
    if (clientId != null) {
      const overlay = clientOverlayMap.get(clientId) || {};
      if (clientCapacity) overlay.capacity = overlay.capacity || clientCapacity;
      const preferredAddress = clientAddress || address; // لو عنوان الموكل فاضي ناخد عنوان الخصم
      if (preferredAddress) overlay.address = overlay.address || preferredAddress;
      const preferredPhone = clientPhone || phone; // لو هاتف الموكل فاضي ناخد هاتف الخصم
      if (preferredPhone) overlay.phone = overlay.phone || preferredPhone;
      clientOverlayMap.set(clientId, overlay);
    }
    return {
      id: id ?? undefined,
      name,
      capacity,
      address,
      phone,
    };
  }).filter(o => o.id != null && o.name !== '');

  // دمج بيانات الموكل (العنوان/الهاتف/الصفة) المستخرجة من سجلات الخصوم
  if (clientOverlayMap.size > 0) {
    clients = clients.map((c) => {
      const ov = clientOverlayMap.get(c.id);
      if (!ov) return c;
      return {
        ...c,
        capacity: ov.capacity || c.capacity,
        address: ov.address || c.address,
        phone: ov.phone || c.phone,
      };
    });
  }

  // 3) الدعاوى
  const casesXml = readUtf8(FILES.cases);
  const caseBlocks = extractBlocks(casesXml, 'جدول_x0020_الدعاوى');
  const cases = caseBlocks.map((blk) => {
    const id = toInt(pickTag(blk, 'معرف_x0020_الدعوى'));
    const opponentId = toInt(pickTag(blk, 'معرف_x0020_الخصم'));
    const clientId = opponentId != null ? (opponentClientMap.get(opponentId) ?? null) : null;
    const court = safeStr(pickTag(blk, 'المحكمة'));
    const caseType = safeStr(pickTag(blk, 'نوع_x0020_الدعوى'));
    const subject = safeStr(pickTag(blk, 'موضوع_x0020_الدعوى'));
    const caseNumber = safeStr(pickTag(blk, 'رقم_x0020_الدعوى'));
    const caseYear = safeStr(pickTag(blk, 'سنة_x0020_الدعوى'));
    const poaNumber = safeStr(pickTag(blk, 'رقم_x0020_التوكيل'));
    const notes = safeStr(pickTag(blk, 'ملاحظات'));
    return {
      id: id ?? undefined,
      clientId: clientId ?? null,
      opponentId: opponentId ?? null,
      caseNumber,
      caseYear,
      court,
      caseType,
      subject,
      poaNumber,
      poaDate: '',
      notes,
      isArchived: false,
    };
  }).filter(cs => cs.id != null);

  // خريطة القضية -> للعثور على clientId في الجلسات
  const caseMap = new Map();
  cases.forEach(c => caseMap.set(c.id, c));

  // 4) الجلسات
  const sessionsXml = readUtf8(FILES.sessions);
  const sessionBlocks = extractBlocks(sessionsXml, 'جدول_x0020_الجلسات');
  const sessions = sessionBlocks.map((blk) => {
    const id = toInt(pickTag(blk, 'معرف_x0020_الجلسة'));
    const caseId = toInt(pickTag(blk, 'معرف_x0020_الدعوى'));
    const dateStr = pickTag(blk, 'تاريخ_x0020_الجلسة');
    const sessionDate = toDateOnly(dateStr);
    const decision = safeStr(pickTag(blk, 'القرار'));
    const roll = toInt(pickTag(blk, 'الرول'));

    const relatedCase = caseMap.get(caseId || -1) || null;
    const clientId = relatedCase ? relatedCase.clientId ?? null : null;
    const court = relatedCase ? safeStr(relatedCase.court) : '';

    const fallbackYear = sessionDate ? parseInt(sessionDate.slice(0, 4), 10) : null;
    const inv = extractInventoryFromDecision(decision, fallbackYear);

    return {
      id: id ?? undefined,
      clientId,
      caseId: caseId ?? null,
      sessionDate,
      sessionTime: '',
      court,
      sessionType: 'جلسة',
      notes: decision,
      inventoryNumber: (inv.number ?? roll ?? null),
      inventoryYear: (inv.year ?? fallbackYear),
    };
  }).filter(s => s.id != null && s.caseId != null && s.sessionDate !== '');

  const out = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    data: {
      clients,
      opponents,
      cases,
      sessions,
      accounts: [],
      administrative: [],
      clerkPapers: [],
      expertSessions: [],
      settings: [
        { key: 'officeName', value: 'محامين مصر الرقمية' }
      ],
    },
  };

  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log(`تم إنشاء ${path.basename(outPath)} بنجاح.`);
  console.log(`Clients: ${clients.length}, Opponents: ${opponents.length}, Cases: ${cases.length}, Sessions: ${sessions.length}`);
}

if (require.main === module) {
  try {
    build();
  } catch (err) {
    console.error('فشل إنشاء النسخة الاحتياطية:', err);
    process.exit(1);
  }
}

module.exports = { build };
