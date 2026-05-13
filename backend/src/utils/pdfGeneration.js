const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Report = require("../models/reportModel");
const getLabel = (list, isAll) => {
  if (isAll || !list || list.length === 0) return "All";
  return list.filter(Boolean).join(", ");
};
// Ensure these paths are correct for your local setup
const logoPath = path.join(__dirname, "../public/logo.png");
const dzongkhaPath = path.join(__dirname, "../public/t.png");

exports.generatePDF = async (
  res,
groups = [],
  year,
  summary = {},
  meta = {}
) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  // =========================
  // FILE SETUP (FIXED)
  // =========================
  const filename = `report_${Date.now()}.pdf`;
  const filePath = path.join(__dirname, "../public/reports", filename);

  const stream = fs.createWriteStream(filePath);

  // IMPORTANT: pipe BEFORE writing
  doc.pipe(stream);
  doc.pipe(res);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Report_${year}.pdf`
  );

  // =========================
  // HEADER (UNCHANGED)
  // =========================
  try {
    doc.image(logoPath, 40, 40, { width: 50 });

    const dzWidth = 140;
    doc.image(dzongkhaPath, (doc.page.width - dzWidth) / 2, 40, {
      width: dzWidth,
    });
  } catch (e) {
    console.log("Header images not found, skipping...");
  }

  doc.moveDown(2.5);
  doc
    .fillColor("#000000")
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("Tarayana Foundation", { align: "center" });

  doc
    .fontSize(10)
    .font("Helvetica-Oblique")
    .fillColor("#666666")
    .text('"Service from the Heart"', { align: "center" });

  doc.moveDown(1.5);
  doc
    .fontSize(18)
    .font("Helvetica")
    .fillColor("#000000")
    .text(`Tarayana Report  ${year}`, { align: "center" });

  doc.moveDown(2);

  // =========================
  // SUBTITLE (CLEANED UP)
// =========================
// SUBTITLE (CLEANED UP)
// =========================

let line1 = (meta.type === "quarterly") 
  ? `Period: ${meta.fromDate} to ${meta.toDate}` 
  : `Year: ${year}`;

const progLabel = getLabel(meta.programmeNames, meta.isAllProgrammes);
const projLabel = getLabel(meta.projectNames, meta.isAllProjects);
const offLabel = getLabel(meta.officerNames, meta.isAllOfficers);
const dzLabel = getLabel(meta.dzongkhagNames, meta.isAllDzongkhags);

line1 += ` | Programmes: ${progLabel} | Projects: ${projLabel}`;
const line2 = `Officers: ${offLabel}`;
const line3 = `Dzongkhags: ${dzLabel}`;

// ONLY CALL THIS ONCE
doc.fontSize(8.5).font("Helvetica-Oblique").fillColor("#444444");
doc.text(line1, { align: "center" });
doc.text(line2, { align: "center" });
doc.text(line3, { align: "center" });



doc.moveDown(1.5);
  // =========================
  // STATS (UNCHANGED)
  // =========================
  const cardWidth = 125;
  const cardHeight = 65;
  const startY = doc.y;
  const spacing = 10;

  const dzSet = new Set();
 groups.forEach((prog) => {
    (prog.projects || []).forEach((proj) => {
      if (proj.dzongkhag) dzSet.add(proj.dzongkhag);
    });
  });

  const stats = [
    {
      label: "Beneficiaries",
      value: summary?.totalBeneficiaries || 0,
      color: "#3498db",
    },
    {
      label: "Projects",
      value: summary?.totalProjects || 0,
      color: "#2ecc71",
    },
    {
      label: "Dzongkhags",
      value: dzSet.size || 0,
      color: "#f1c40f",
    },
  ];

  stats.forEach((stat, i) => {
    const x = 40 + i * (cardWidth + spacing);

    doc
      .roundedRect(x, startY, cardWidth, cardHeight, 10)
      .fillColor("#f8f9fa")
      .fill();

    doc
      .circle(x + 22, startY + 32, 13)
      .fillColor(stat.color)
      .fill();

    doc
      .fillColor("#555555")
      .fontSize(9)
      .font("Helvetica")
      .text(stat.label, x + 42, startY + 18);

    doc
      .fillColor("#000000")
      .fontSize(13)
      .font("Helvetica-Bold")
      .text(stat.value.toString(), x + 42, startY + 33);
  });

  doc.y = startY + cardHeight + 40;

  // =========================
  // BODY (UNCHANGED)
  // =========================
  
  const groupLabelPrefix = {
    officer: "Officer",
    dzongkhag: "Dzongkhag",
    programme: "Programme"
  }[meta.groupingMode || "programme"];

  groups.forEach((group) => {
    if (doc.y > 600) doc.addPage();

    doc.moveDown(2);
    doc
      .fillColor("#2c3e50")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`${groupLabelPrefix}: ${group.groupTitle}`, 40);

    (group.projects || []).forEach((project) => {
      if (doc.y > 650) doc.addPage();

      doc.moveDown(1);
      doc
        .fillColor("#16a085")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(`Project: ${project.projectName}`, 40);

      if (project.projectActivities && project.projectActivities.length > 0) {
        project.projectActivities.forEach((act) => {
          doc
            .fillColor("#333")
            .fontSize(9)
            .font("Helvetica")
            .text(`• ${act.name}: ${act.total} ${act.unit}`, 50);
        });
      } else {
        doc
          .fillColor("#7f8c8d")
          .fontSize(9)
          .font("Helvetica-Oblique")
          .text("• No activities recorded", 50);
      }

      // --- Beneficiaries Table ---
      doc.moveDown(1.2); 
      
      doc
        .fillColor("#333333")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Beneficiaries", 40);

      doc.moveDown(0.5);
      
      let tableTop = doc.y;

      if (!project.beneficiaries || project.beneficiaries.length === 0) {
        doc
          .fillColor("#7f8c8d")
          .fontSize(9)
          .font("Helvetica-Oblique")
          .text("• No beneficiaries registered", 50);
        return; 
      }

      // 1. Updated Column X-positions to fit "Activities"
      const colX = {
        cid: 45,
        name: 100,
        gender: 190,
        dz: 230,
        village: 300,
        activities: 370, // New Column
        indirect: 510,
      };

      // Header Background
      doc
        .rect(40, tableTop - 4, 525, 18)
        .fillColor("#f2f4f4")
        .fill();

      doc.fillColor("#2d3436").fontSize(8).font("Helvetica-Bold");

      doc.text("CID", colX.cid, tableTop);
      doc.text("Name", colX.name, tableTop);
      doc.text("Gen", colX.gender, tableTop);
      doc.text("Dzongkhag", colX.dz, tableTop);
      doc.text("Village", colX.village, tableTop);
      doc.text("Activities (Qty)", colX.activities, tableTop); // New Header
      doc.text("Indir.", colX.indirect, tableTop);

      let rowY = tableTop + 18;

      project.beneficiaries.forEach((b, index) => {
        // Prepare activity string for this specific beneficiary
        const activityStrings = (b.keyActivities || [])
          .map(a => `${a.activityName} (${a.totalQuantity})`)
          .join(", ");

        // Calculate height needed for this row (in case activities wrap)
        const activityWidth = 135;
        const textHeight = doc.heightOfString(activityStrings || "-", { width: activityWidth });
        const rowHeight = Math.max(textHeight + 10, 20); // Minimum height of 20

        // Page break logic based on dynamic row height
        if (rowY + rowHeight > 750) {
          doc.addPage();
          rowY = 50;
        }

        // Zebra Striping
        if (index % 2 === 0) {
          doc
            .rect(40, rowY - 3, 525, rowHeight)
            .fillColor("#fdfdfd")
            .fill();
        }

        doc.fillColor("#2d3436").font("Helvetica").fontSize(7.5);

        const indirect =
          (b.indirectBeneficiaries?.male || 0) +
          (b.indirectBeneficiaries?.female || 0);

        doc.text(b.cid || "-", colX.cid, rowY);
        doc.text(b.name || "-", colX.name, rowY, { width: 85 });
        doc.text(b.gender || "-", colX.gender, rowY);
        doc.text(b.dzongkhag || "-", colX.dz, rowY, { width: 65 });
        doc.text(b.village || "-", colX.village, rowY, { width: 65 });
        
        // The wrapped Activities column
        doc.text(activityStrings || "-", colX.activities, rowY, { width: activityWidth });
        
        doc.text(indirect.toString(), colX.indirect, rowY);

        rowY += rowHeight;
      });

      doc.y = rowY + 10;
    });
  });
  // =========================
  // FINALIZE (FIXED)
  // =========================
  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
  await Report.create({
  title: `${meta.type === "annual" ? "Annual" : "Quarterly"} Report ${year}`,
  type: meta.type,
  year,
  fileUrl: `/reports/${filename}`,
  createdAt: new Date(),
});
};