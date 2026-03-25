import { render, screen } from "@testing-library/react";
import {
  StatusBadge,
  getShipmentStatusVariant,
  getManifestStatusVariant,
  getInvoiceStatusVariant,
  getExceptionStatusVariant,
  getSeverityVariant,
} from "@/components/shared/status-badge";

describe("StatusBadge", () => {
  it("renders label text", () => {
    render(<StatusBadge label="Active" variant="success" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders with dot indicator when dot prop is true", () => {
    const { container } = render(
      <StatusBadge label="Pending" variant="warning" dot />
    );
    const dots = container.querySelectorAll("span span");
    expect(dots.length).toBeGreaterThan(0);
  });
});

describe("getShipmentStatusVariant", () => {
  it("returns success for DELIVERED", () => {
    expect(getShipmentStatusVariant("DELIVERED")).toBe("success");
  });

  it("returns muted for CREATED", () => {
    expect(getShipmentStatusVariant("CREATED")).toBe("muted");
  });

  it("returns warning for IN_TRANSIT", () => {
    expect(getShipmentStatusVariant("IN_TRANSIT")).toBe("warning");
  });

  it("returns error for EXCEPTION", () => {
    expect(getShipmentStatusVariant("EXCEPTION")).toBe("error");
  });

  it("returns muted for unknown status", () => {
    expect(getShipmentStatusVariant("UNKNOWN_STATUS")).toBe("muted");
  });
});

describe("getManifestStatusVariant", () => {
  it("returns success for ARRIVED", () => {
    expect(getManifestStatusVariant("ARRIVED")).toBe("success");
  });

  it("returns warning for DEPARTED", () => {
    expect(getManifestStatusVariant("DEPARTED")).toBe("warning");
  });

  it("returns info for OPEN", () => {
    expect(getManifestStatusVariant("OPEN")).toBe("info");
  });
});

describe("getInvoiceStatusVariant", () => {
  it("returns success for PAID", () => {
    expect(getInvoiceStatusVariant("PAID")).toBe("success");
  });

  it("returns error for OVERDUE", () => {
    expect(getInvoiceStatusVariant("OVERDUE")).toBe("error");
  });

  it("returns muted for DRAFT", () => {
    expect(getInvoiceStatusVariant("DRAFT")).toBe("muted");
  });
});

describe("getExceptionStatusVariant", () => {
  it("returns error for OPEN", () => {
    expect(getExceptionStatusVariant("OPEN")).toBe("error");
  });

  it("returns success for RESOLVED", () => {
    expect(getExceptionStatusVariant("RESOLVED")).toBe("success");
  });

  it("returns warning for IN_PROGRESS", () => {
    expect(getExceptionStatusVariant("IN_PROGRESS")).toBe("warning");
  });
});

describe("getSeverityVariant", () => {
  it("returns error for CRITICAL", () => {
    expect(getSeverityVariant("CRITICAL")).toBe("error");
  });

  it("returns warning for MEDIUM", () => {
    expect(getSeverityVariant("MEDIUM")).toBe("warning");
  });

  it("returns info for LOW", () => {
    expect(getSeverityVariant("LOW")).toBe("info");
  });
});
