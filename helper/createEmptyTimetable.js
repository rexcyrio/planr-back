function createEmptyTimetable() {
  const arr = [];

  for (let i = 0; i < 48; i++) {
    arr.push(["0", "0", "0", "0", "0", "0", "0"]);
  }

  return arr;
}

module.exports = createEmptyTimetable;
