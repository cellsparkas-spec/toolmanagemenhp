import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

export interface ReceiptData {
  saleId: number;
  storeName: string;
  storeAddress?: string | null;
  storePhone?: string | null;
  createdAt: string;
  phoneBrand: string;
  phoneModel: string;
  phoneImei: string;
  phoneColor?: string | null;
  phoneStorage?: string | null;
  warrantyMonths?: number;
  warrantyExpiresAt?: string | null;
  customerName: string;
  customerPhone?: string | null;
  customerPhoto?: string | null;
  salePrice: number;
  feeAmount: number;
  staffName?: string | null;
}

interface ReceiptModalProps { open: boolean; onClose: () => void; data: ReceiptData; }

function formatRp(n: number) { return "Rp " + n.toLocaleString("id-ID"); }
function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function ReceiptModal({ open, onClose, data }: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;
    const win = window.open("", "_blank", "width=420,height=700");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Nota - ${data.storeName}</title>
    <style>* { margin:0;padding:0;box-sizing:border-box } body { font-family:'Courier New',monospace;font-size:11px;color:#000;background:#fff;width:72mm;margin:0 auto }
    .receipt{padding:8px}.center{text-align:center}.bold{font-weight:bold}.large{font-size:14px}.xlarge{font-size:16px}
    .divider{border-top:1px dashed #000;margin:6px 0}.row{display:flex;justify-content:space-between;margin:2px 0}.row .label{color:#555}
    .photo{text-align:center;margin:6px 0}.photo img{width:80px;height:80px;object-fit:cover;border-radius:4px;border:1px solid #ccc}
    .footer{text-align:center;font-size:10px;color:#666;margin-top:8px}.warranty-box{border:1px solid #000;padding:4px 6px;margin:6px 0;text-align:center}
    </style></head><body><div class="receipt">${printContent}</div></body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const warrantyExpires = data.warrantyExpiresAt
    ? new Date(data.warrantyExpiresAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2 flex flex-row items-center justify-between">
          <DialogTitle className="text-base">Nota Penjualan</DialogTitle>
          <div className="flex gap-2">
            <Button size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="h-3.5 w-3.5" /> Cetak Nota
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[80vh] px-1 pb-4">
          <div ref={printRef} className="font-mono text-[11px] text-black p-3 space-y-0.5" style={{ width: "100%", maxWidth: "280px", margin: "0 auto" }}>
            <div className="center bold xlarge">{data.storeName}</div>
            {data.storeAddress && <div className="center" style={{ fontSize: 10, color: "#555" }}>{data.storeAddress}</div>}
            {data.storePhone && <div className="center" style={{ fontSize: 10, color: "#555" }}>Telp: {data.storePhone}</div>}
            <div className="divider" />
            <div className="center bold" style={{ fontSize: 12 }}>NOTA PENJUALAN</div>
            <div className="row"><span className="label">No. Nota</span><span className="bold">#{String(data.saleId).padStart(5, "0")}</span></div>
            <div className="row"><span className="label">Tanggal</span><span>{formatDate(data.createdAt)}</span></div>
            <div className="row"><span className="label">Kasir</span><span>{data.staffName || "-"}</span></div>
            <div className="divider" />
            <div className="bold" style={{ marginBottom: 3 }}>Detail HP</div>
            <div className="row"><span className="label">Merek</span><span>{data.phoneBrand} {data.phoneModel}</span></div>
            {data.phoneColor && <div className="row"><span className="label">Warna</span><span>{data.phoneColor}</span></div>}
            {data.phoneStorage && <div className="row"><span className="label">Storage</span><span>{data.phoneStorage}</span></div>}
            <div className="row"><span className="label">IMEI</span><span style={{ fontFamily: "monospace" }}>{data.phoneImei}</span></div>
            <div className="divider" />
            <div className="bold" style={{ marginBottom: 3 }}>Data Pembeli</div>
            <div className="row"><span className="label">Nama</span><span>{data.customerName}</span></div>
            {data.customerPhone && <div className="row"><span className="label">No HP</span><span>{data.customerPhone}</span></div>}
            {data.customerPhoto && (
              <div className="photo">
                <div style={{ fontSize: 9, color: "#888", marginBottom: 3 }}>Foto Verifikasi Pembeli</div>
                <img src={data.customerPhoto} alt="Foto Pembeli" />
              </div>
            )}
            <div className="divider" />
            <div className="bold" style={{ marginBottom: 3 }}>Rincian Harga</div>
            <div className="row"><span className="label">Harga Jual</span><span>{formatRp(data.salePrice)}</span></div>
            {data.feeAmount > 0 && <div className="row"><span className="label">Fee</span><span>{formatRp(data.feeAmount)}</span></div>}
            <div className="row bold" style={{ borderTop: "1px solid #000", paddingTop: 3, marginTop: 3 }}>
              <span>TOTAL BAYAR</span><span>{formatRp(data.salePrice + data.feeAmount)}</span>
            </div>
            {warrantyExpires && (
              <>
                <div className="divider" />
                <div className="warranty-box">
                  <div className="bold" style={{ fontSize: 11 }}>KARTU GARANSI</div>
                  <div style={{ marginTop: 2 }}>{data.phoneBrand} {data.phoneModel}</div>
                  <div style={{ fontSize: 10 }}>Garansi {data.warrantyMonths} Bulan</div>
                  <div style={{ fontSize: 10, marginTop: 2 }}>Berlaku s/d: <span className="bold">{warrantyExpires}</span></div>
                </div>
              </>
            )}
            <div className="divider" />
            <div className="footer">
              <div>Terima kasih telah berbelanja</div>
              <div>di {data.storeName}</div>
              <div style={{ marginTop: 4, fontSize: 9 }}>Barang yang sudah dibeli tidak dapat dikembalikan</div>
              <div style={{ fontSize: 9 }}>Garansi sesuai ketentuan toko</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
