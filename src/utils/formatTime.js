export const formatTime = (utcDateStr) => {
    const date = new Date(utcDateStr);
    const jakartaTime = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

    return {
        date: `${String(jakartaTime.getDate()).padStart(2, "0")}-${String(jakartaTime.getMonth() + 1).padStart(2, "0")}-${jakartaTime.getFullYear()}`,
        time: `${String(jakartaTime.getHours()).padStart(2, "0")}:${String(jakartaTime.getMinutes()).padStart(2, "0")}`,
    };
};
