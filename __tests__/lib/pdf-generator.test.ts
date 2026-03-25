import { generateTablePdf } from "@/lib/pdf-generator";

jest.mock("jspdf", () => {
  const mockDoc = {
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    save: jest.fn(),
    getNumberOfPages: jest.fn().mockReturnValue(1),
    setPage: jest.fn(),
    internal: {
      pageSize: { getWidth: () => 210, getHeight: () => 297 },
    },
  };
  return jest.fn(() => mockDoc);
});

jest.mock("jspdf-autotable", () => jest.fn());

describe("generateTablePdf", () => {
  it("generates a PDF without throwing", () => {
    expect(() =>
      generateTablePdf({
        title: "Test Report",
        columns: [
          { header: "Name", dataKey: "name" },
          { header: "Value", dataKey: "value" },
        ],
        rows: [
          { name: "Item A", value: "100" },
          { name: "Item B", value: "200" },
        ],
      })
    ).not.toThrow();
  });

  it("accepts optional subtitle and orientation", () => {
    expect(() =>
      generateTablePdf({
        title: "Landscape Report",
        subtitle: "With subtitle",
        orientation: "landscape",
        columns: [{ header: "Col", dataKey: "col" }],
        rows: [{ col: "val" }],
      })
    ).not.toThrow();
  });
});
