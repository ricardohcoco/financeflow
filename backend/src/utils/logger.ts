type LogLevel = "info" | "warn" | "error";

type LogDetails = {
    event: string;
    code?: string;
    status?: number;
};

export function log(
    level: LogLevel,
    details: LogDetails
) {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        ...details,
    };

    const output = JSON.stringify(entry);

    if (level === "error") {
        console.error(output);
        return;
    }

    if (level === "warn") {
        console.warn(output);
        return;
    }

    console.info(output);
}