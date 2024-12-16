export const formatTime = (utcDateStr) => {
    const date = new Date(utcDateStr);
    const jakartaTime = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

    return {
        date: `${jakartaTime.getFullYear()}-${String(jakartaTime.getMonth() + 1).padStart(2, "0")}-${String(jakartaTime.getDate()).padStart(2, "0")}`,
        time: `${String(jakartaTime.getHours()).padStart(2, "0")}:${String(jakartaTime.getMinutes()).padStart(2, "0")}`,
    };
};