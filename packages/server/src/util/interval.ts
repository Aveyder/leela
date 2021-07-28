export async function setIntervalAsync(callback: () => Promise<void>, ms: number): Promise<void> {
    callback().then(() => {
        setTimeout(() => setIntervalAsync(callback, ms), ms);
    });
}
