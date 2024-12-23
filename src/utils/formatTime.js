export const formatTime = (utcDateStr) => {
  const date = new Date(utcDateStr);
  const jakartaTime = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

  return {
    date: `${jakartaTime.getFullYear()}-${String(jakartaTime.getMonth() + 1).padStart(2, "0")}-${String(jakartaTime.getDate()).padStart(2, "0")}`,
    time: `${String(jakartaTime.getHours()).padStart(2, "0")}:${String(jakartaTime.getMinutes()).padStart(2, "0")}`,
  };
};

export const formatedDateAndYear = async (isoString) => {
  const dateObj = new Date(isoString);
  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  };
  const formattedDate = dateObj.toLocaleDateString('id-ID', options);
  // const waktu = tanggalObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

  return formattedDate;
};

export const formatedDate = async (isoString) => {
  const dateObj = new Date(isoString);

  const options = {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit'
  };

  const formattedParts = dateObj.toLocaleDateString('id-ID', options).split(' ');

  const [day, month] = formattedParts;

  const hour = dateObj.getUTCHours().toString().padStart(2, '0');
  const minute = dateObj.getUTCMinutes().toString().padStart(2, '0');

  return `${day} ${month}, ${hour}:${minute}`;
};