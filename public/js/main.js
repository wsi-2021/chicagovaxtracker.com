document.querySelector('html').className = 'js';

var table = document.querySelector('table#records');

table.addEventListener('click', function(e) {
  if (e.target.tagName !== 'TH') return; // leave
  var th = e.target;
  th.classList.toggle('desc');
  sortTable(table, th.cellIndex, th.className);
  localStorage.setItem('cellIndex', th.cellIndex);
  localStorage.setItem('order', th.className);
});

function sortTable(table, columnIndex, order) {
  var rows = Array.from(table.querySelector('tbody').rows);

  rows.sort(function(a, b) {
    if (isNaN(a.cells[columnIndex].dataset.value)) {
      return a.cells[columnIndex].dataset.value > b.cells[columnIndex].dataset.value ? 1 : -1;
    } else {
      return a.cells[columnIndex].dataset.value - b.cells[columnIndex].dataset.value;
    }
  });

  if (order === 'desc') {
    rows.reverse();
  }

  table.querySelector('tbody').append(...rows);
}

var days_nav = document.querySelector('ul.days');

days_nav.addEventListener('click', function(e) {
  if (e.target.tagName !== 'A') return; // leave
  e.preventDefault();
  var href = e.target.getAttribute('href');
  var api_endpoint = '/api' + href;
  fetch(api_endpoint)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      var tbody = document.querySelector('table#records tbody');
      tbody.innerHTML = "";
      for (d of data) {
        var tr = document.querySelector('template#tr').content.cloneNode(true);
        var td = tr.querySelectorAll('td');
        var dt = new Date(d.date);
        var pretty_date = `${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear()}`;
        td[0].dataset.value = d.date;
        td[0].innerText = pretty_date;
        td[1].dataset.value = d.total_doses_daily;
        td[1].innerText = d.total_doses_daily;
        td[2].dataset.value = d.total_doses_cumulative;
        td[2].innerText = d.total_doses_cumulative;
        tbody.append(tr);
      }

      if (localStorage.getItem('cellIndex')) {
        var ci = localStorage.getItem('cellIndex');
        var order = localStorage.getItem('order');
        document.querySelectorAll('thead th')[ci].className = order;
        sortTable(table, ci, order);
      }

      if (history.pushState) {
        history.pushState('', '', href);
      }

    })
    .catch(function(error) {
      console.log(error);
    });
});
