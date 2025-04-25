// (() => {
//   let dataTables = [];
//   console.log("Script is working");
//   const findDataTables = (dataTables) => {
//     const tables = document.getElementsByTagName("table");
//     for (let table of tables) {
//       const t = table.querySelectorAll("td > table");
//       console.log(t);
//       if (t.length > 0) {
//         dataTables.push(...t);
//         console.log(dataTables);
//       }
//     }
//   };

//   const extractDataCollection = (dataTable) => {
//     const rows = dataTable.querySelectorAll("tr");
//     let keys = [];
//     Array.from(rows[0].querySelectorAll("td"), (el) => {
//       keys.push(el.innerHTML);
//     });
//     const dataList = [];

//     for (let i = 1; i < rows.length; i++) {
//       let obj = {};
//       Array.from(rows[i].querySelectorAll("td"), (el, idx) => {
//         obj[keys[idx]] = el.innerText;
//       });
//       // console.log(obj);
//       dataList.push(obj);
//     }
//     return dataList;
//   };

//   findDataTables(dataTables);
//   console.log(dataTables);
//   const collectionList = [];

//   for (let i of dataTables) {
//     collectionList.push(extractDataCollection(i));
//   }
//   console.log(collectionList);
// })();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let dataTables = [];
  console.log("Script is working");
  const findDataTables = (dataTables) => {
    const tables = document.getElementsByTagName("table");
    for (let table of tables) {
      const t = table.querySelectorAll("td > table");
      console.log(t);
      if (t.length > 0) {
        dataTables.push(...t);
        console.log(dataTables);
      }
    }
  };

  const extractDataCollection = (dataTable) => {
    const rows = dataTable.querySelectorAll("tr");
    let keys = [];
    Array.from(rows[0].querySelectorAll("td"), (el) => {
      keys.push(el.innerHTML);
    });
    const dataList = [];

    for (let i = 1; i < rows.length; i++) {
      let obj = {};
      Array.from(rows[i].querySelectorAll("td"), (el, idx) => {
        obj[keys[idx]] = el.innerText;
      });
      // console.log(obj);
      dataList.push(obj);
    }
    return dataList;
  };

  findDataTables(dataTables);
  console.log(dataTables);
  const collectionList = [];

  for (let i of dataTables) {
    collectionList.push(extractDataCollection(i));
  }
  console.log(collectionList);
  sendResponse({ data: collectionList, success: true });
});
