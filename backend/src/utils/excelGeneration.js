const generateExcel = async (res, projects, beneficiaries, summary) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report");

  sheet.addRow(["Total Projects", summary.totalProjects]);
  sheet.addRow(["Total Beneficiaries", summary.totalBeneficiaries]);
  sheet.addRow(["Male", summary.male]);
  sheet.addRow(["Female", summary.female]);

  sheet.addRow([]);

  sheet.addRow(["Projects"]);
  sheet.addRow(["Name", "Dzongkhag", "Programme"]);

  projects.forEach(p => {
    sheet.addRow([
      p.projectName,
      p.dzongkhag,
      p.programme?.programmeName
    ]);
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=report.xlsx"
  );

  await workbook.xlsx.write(res);
  res.end();
};