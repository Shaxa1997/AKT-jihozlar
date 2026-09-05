import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Equipment } from '../../types';

export async function generateEquipmentPassportPDF(equipment: Equipment) {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  // Generate QR code base64
  const verifyUrl = `${window.location.origin}?verify=${equipment.code}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 });

  // Outer border frame
  doc.setDrawColor(210, 220, 235);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 277);

  // Header Banner
  doc.setFillColor(30, 58, 138); // Dark Navy Blue
  doc.rect(10, 10, 190, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('JIHOZ PASPORTI VA KUZATUV HUJJATI', 15, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Tashkilot Inventarizatsiya va Nazorat Sistemasi', 15, 28);

  // Add QR Code at top right
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', 170, 12, 20, 20);
  }

  // Equipment Code Title Box
  doc.setFillColor(241, 245, 249);
  doc.rect(15, 40, 180, 16, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(15, 40, 180, 16, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`KOD: ${equipment.code}`, 20, 50);

  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235);
  doc.text(`Holati: ${equipment.status.toUpperCase()}`, 130, 50);

  // Specifications Table
  let y = 64;
  const specFields = [
    ['Jihoz Nomi / Turi', `${equipment.name} (${equipment.typeName})`],
    ['Brend / Model', `${equipment.brand || '—'} / ${equipment.model || '—'}`],
    ['Seriya Raqami', equipment.serialNumber || '—'],
    ['Inventar Raqami', equipment.inventoryNumber || '—'],
    ['Ishlab Chiqarilgan Yili', String(equipment.manufactureYear)],
    ['Kimga Tegishliligi', equipment.ownerType.toUpperCase()],
    ['Biriktirilgan Bo\'lim', equipment.departmentName || '—'],
    ['Foydalanayotgan Shaxs', equipment.currentUserName],
    ['Xodim Lavozimi', equipment.userPosition || '—'],
    ['Joylashgan Xona/Manzil', equipment.locationRoom || '—'],
    ['Qo\'shilgan Sana', new Date(equipment.createdAt).toLocaleDateString('uz-UZ')]
  ];

  doc.setFontSize(10);
  specFields.forEach(([label, value], idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 4, 180, 7, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(label, 20, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value, 85, y);

    y += 8;
  });

  // Notes Section
  if (equipment.notes) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Izoh va Qo\'shimcha Ma\'lumot:', 15, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(equipment.notes, 15, y, { maxWidth: 180 });
    y += 12;
  } else {
    y += 6;
  }

  // Signature Block
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(250, 250, 250);
  doc.rect(15, y, 180, 45, 'F');
  doc.rect(15, y, 180, 45, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('QABUL QILUVCHI VA TASDIQLOVCHI ELEKTRON IMZO:', 20, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Imzo Egasi (F.I.O.): ${equipment.signedBy || equipment.currentUserName}`, 20, y + 16);
  doc.text(`Tasdiqlangan Sana: ${equipment.signedAt ? new Date(equipment.signedAt).toLocaleString('uz-UZ') : new Date(equipment.createdAt).toLocaleString('uz-UZ')}`, 20, y + 22);

  // Embed Signature Image if available
  if (equipment.signatureUrl) {
    try {
      doc.addImage(equipment.signatureUrl, 'PNG', 120, y + 5, 65, 30);
    } catch (e) {
      doc.text('[Elektron Imzo mavjud]', 125, y + 20);
    }
  } else {
    doc.setTextColor(148, 163, 184);
    doc.text('(Elektron Imzo chekilgan)', 130, y + 22);
  }

  // Footer text
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Ushbu pasport elektron tarzda generatsiya qilindi va QR-kod orqali autentifikatsiya qilinadi.', 15, 282);

  // Save PDF
  doc.save(`Jihoz_Pasporti_${equipment.code}.pdf`);
}
