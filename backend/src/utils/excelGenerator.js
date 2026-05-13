const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const Report = require("../models/reportModel");

const getLabel = (list, isAll) => {
  if (isAll || !list || list.length === 0) return "All";
  return list.filter(Boolean).join(", ");
};

exports.generateExcel = async (
  res,
  groups = [],
  year,
  summary = {},
  meta = {}
) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(`Report ${year}`);

  // =========================
  // FILE SETUP (Mirrors PDF Logic)
  // =========================
  const filename = `report_${Date.now()}.xlsx`;
  const filePath = path.join(__dirname, "../public/reports", filename);
  const stream = fs.createWriteStream(filePath);

  // Set headers immediately
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Report_${year}.xlsx`
  );

  // =========================
  // HEADER & META (Styling)
  // =========================
  sheet.mergeCells("A1:G1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "Tarayana Foundation";
  titleCell.font = { size: 18, bold: true };
  titleCell.alignment = { horizontal: "center" };

  sheet.mergeCells("A2:G2");
  const subtitleCell = sheet.getCell("A2");
  subtitleCell.value = `Tarayana Report ${year}`;
  subtitleCell.font = { size: 14, bold: true };
  subtitleCell.alignment = { horizontal: "center" };

  // Subtitle Labels (Line 1, 2, 3 logic like PDF)
  const progLabel = getLabel(meta.programmeNames, meta.isAllProgrammes);
  const projLabel = getLabel(meta.projectNames, meta.isAllProjects);
  const offLabel = getLabel(meta.officerNames, meta.isAllOfficers);
  const dzLabel = getLabel(meta.dzongkhagNames, meta.isAllDzongkhags);

  sheet.addRow([`Period: ${meta.type === "quarterly" ? `${meta.fromDate} to ${meta.toDate}` : year} | Programmes: ${progLabel} | Projects: ${projLabel}`]);
  sheet.lastRow.alignment = { horizontal: "center" };
  sheet.addRow([`Officers: ${offLabel}`]);
  sheet.lastRow.alignment = { horizontal: "center" };
  sheet.addRow([`Dzongkhags: ${dzLabel}`]);
  sheet.lastRow.alignment = { horizontal: "center" };

  sheet.addRow([]); // Spacer

  // =========================
  // STATS CARDS (Simplified for Excel)
  // =========================
  sheet.addRow(["Summary Statistics"]).font = { bold: true };
  sheet.addRow(["Beneficiaries", summary?.totalBeneficiaries || 0]);
  sheet.addRow(["Projects", summary?.totalProjects || 0]);
  sheet.addRow([]);

  // =========================
  // BODY (Grouping & Projects)
  // =========================
  const groupLabelPrefix = {
    officer: "Officer",
    dzongkhag: "Dzongkhag",
    programme: "Programme"
  }[meta.groupingMode || "programme"];

  groups.forEach((group) => {
    const gRow = sheet.addRow([`${groupLabelPrefix}: ${group.groupTitle}`]);
    gRow.font = { bold: true, size: 12 };
    gRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F0FE' } };

    (group.projects || []).forEach((project) => {
      const pRow = sheet.addRow([`Project: ${project.projectName}`]);
      pRow.font = { bold: true, color: { argb: "FF16A085" } };

      // Project Activities
      if (project.projectActivities?.length > 0) {
        project.projectActivities.forEach(act => {
          sheet.addRow([`• ${act.name}: ${act.total} ${act.unit}`]).font = { italic: true, size: 9 };
        });
      }

      sheet.addRow(["Beneficiaries"]).font = { bold: true };
      
      const headerRow = sheet.addRow(["CID", "Name", "Gen", "Dzongkhag", "Village", "Activities (Qty)", "Indir."]);
      headerRow.eachCell(cell => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D3436' } };
      });

      (project.beneficiaries || []).forEach((b, idx) => {
        const activityStrings = (b.keyActivities || [])
          .map(a => `${a.activityName} (${a.totalQuantity})`)
          .join(", ");
        const indirect = (b.indirectBeneficiaries?.male || 0) + (b.indirectBeneficiaries?.female || 0);

        const row = sheet.addRow([
          b.cid || "-",
          b.name || "-",
          b.gender || "-",
          b.dzongkhag || "-",
          b.village || "-",
          activityStrings || "-",
          indirect
        ]);
        row.font = { size: 9 };
        row.getCell(6).alignment = { wrapText: true };
        
        // Zebra striping like PDF
        if (idx % 2 === 0) {
          row.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9F9' } };
          });
        }
      });
      sheet.addRow([]); // Spacer between projects
    });
  });

  // Set column widths
  sheet.columns = [
    { width: 15 }, { width: 25 }, { width: 8 }, { width: 15 }, { width: 15 }, { width: 40 }, { width: 8 }
  ];

  // =========================
  // FINALIZE (Stream Handling)
  // =========================
  
  // Use a Promise to handle the stream finishing, just like the PDF
  await new Promise((resolve, reject) => {
    // Write to the file stream
    workbook.xlsx.write(stream)
      .then(() => stream.end())
      .catch(reject);

    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  // Pipe the workbook to the response
  await workbook.xlsx.write(res);

  // Save to Database
  await Report.create({
    title: `${meta.type === "annual" ? "Annual" : "Quarterly"} Report ${year}`,
    type: meta.type,
    year,
    fileUrl: `/reports/${filename}`,
    createdAt: new Date(),
  });

  res.end();
};