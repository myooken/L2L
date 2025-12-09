import type { P2PStatus } from "../hooks/useP2P";

export const P2P_STATUS_TEXT: Record<P2PStatus, string> = {
    connected: "接続しました",
    connecting: "接続中…",
    retrying: "再接続中…",
    listening: "相手を待っています",
    idle: "待機中",
    error: "エラーが発生しました",
};

export const P2P_MAX_RETRIES = 0;
export const P2P_RETRY_DELAY_MS = 1500;
export const INVITE_LINK_RESET_MS = 2000;
