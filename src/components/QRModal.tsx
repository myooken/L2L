import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useAppStatus } from "../context/AppStatusContext";
import { copyToClipboard } from "../utils/share";

interface QRModalProps {
    title: string;
    link: string;
    onClose: () => void;
}

export const QRModal = ({ title, link, onClose }: QRModalProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { pushMessage } = useAppStatus();
    const [copyLinkStatus, setCopyLinkStatus] = useState<"idle" | "copied">("idle");
    const [copyImageStatus, setCopyImageStatus] = useState<"idle" | "copied">("idle");

    const handleCopyImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.toBlob((blob) => {
            if (!blob) return;
            navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob })
            ]).then(() => {
                setCopyImageStatus("copied");
                setTimeout(() => setCopyImageStatus("idle"), 2000);
            }).catch(() => {
                pushMessage("画像のコピーに失敗しました", "error");
            });
        });
    };

    const handleCopyLink = () => {
        copyToClipboard(link).then((ok) => {
            if (ok) {
                setCopyLinkStatus("copied");
                setTimeout(() => setCopyLinkStatus("idle"), 2000);
            } else {
                pushMessage("コピーに失敗しました", "error");
            }
        });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <header>
                    <span>{title}</span>
                    <button className="modal-close" aria-label="閉じる" onClick={onClose}>
                        ×
                    </button>
                </header>
                <div className="qr-container">
                    <QRCodeCanvas ref={canvasRef} value={link} size={200} includeMargin={true} />
                </div>
                <div className="url-display">
                    <span className="url-text">{link}</span>
                </div>
                <div className="modal-actions">
                    <div className="btn-wrapper">
                        {copyLinkStatus === "copied" && <span className="copy-feedback">コピーしました！</span>}
                        <button className="btn small primary" onClick={handleCopyLink}>
                            🔗 リンクをコピー
                        </button>
                    </div>
                    <div className="btn-wrapper">
                        {copyImageStatus === "copied" && <span className="copy-feedback">コピーしました！</span>}
                        <button className="btn small" onClick={handleCopyImage}>
                            🖼️ QR画像をコピー
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
