// Load dari localStorage, fallback ke data default jika kosong
const saved = localStorage.getItem("transactions");
let transactions = saved ? JSON.parse(saved) : [
  { name: "Shopping", amount: 3.56, category: "Fun", date: "2025-05-01" },
  { name: "Cilok", amount: 14.94, category: "Food", date: "2025-05-02" }
];

let editingIndex = null;
let chartInstance = null;

// Simpan ke localStorage setiap kali data berubah
function saveToStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateSummary() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  document.getElementById("totalAmount").textContent = "Rp " + total.toLocaleString("id-ID", { minimumFractionDigits: 2 });
}

function renderTransactions() {
  const container = document.getElementById("transactions");
  container.innerHTML = "";

  transactions.forEach((t, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <span>${t.date} | ${t.name} - Rp${t.amount} (${t.category})</span>
      <div>
        <button class="btn-edit" onclick="editTransaction(${i})">Edit</button>
        <button class="btn-delete" onclick="deleteTransaction(${i})">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });

  updateSummary();
  updateChart();
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  saveToStorage();
  renderTransactions();
}

function editTransaction(index) {
  const t = transactions[index];
  document.getElementById("name").value = t.name;
  document.getElementById("amount").value = t.amount;
  document.getElementById("date").value = t.date;
  document.getElementById("category").value = t.category;

  editingIndex = index;
  const submitBtn = document.querySelector("#transactionForm button[type='submit']");
  submitBtn.textContent = "Simpan Perubahan";
  submitBtn.classList.add("btn-save");
  submitBtn.classList.remove("btn-tambah");
}

function updateChart() {
  const totals = {};
  transactions.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const canvas = document.getElementById("myChart");
  const ctx = canvas.getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  const labels = Object.keys(totals);
  const data = Object.values(totals);

  // Warna default per kategori
  const colorMap = {
    "Food": "#ff6384",
    "Transport": "#36a2eb",
    "Fun": "#ffce56",
    "Shopping": "#4bc0c0"
  };

  // Mapping gambar motif per kategori
  const patternFiles = {
    "Food": "assets/download (2).jpg",
    "Shopping": "assets/download (1).jpg",
    "Transport": "assets/transport 1.jpg"
  };

  // Load semua gambar motif lalu buat chart
  const patternCategories = Object.keys(patternFiles);
  const loadedPatterns = {};
  let loadedCount = 0;

  function buildChart() {
    const backgroundColor = labels.map(label => {
      if (loadedPatterns[label]) return loadedPatterns[label];
      return colorMap[label] || "#cccccc";
    });

    chartInstance = new Chart(canvas, {
      type: "pie",
      data: {
        labels,
        datasets: [{ data, backgroundColor }]
      }
    });
  }

  if (patternCategories.length === 0) {
    buildChart();
  } else {
    patternCategories.forEach(category => {
      const img = new Image();
      img.src = patternFiles[category];
      img.onload = function () {
        loadedPatterns[category] = ctx.createPattern(img, "repeat");
        loadedCount++;
        if (loadedCount === patternCategories.length) buildChart();
      };
      img.onerror = function () {
        loadedCount++;
        if (loadedCount === patternCategories.length) buildChart();
      };
    });
  }
}

document.getElementById("transactionForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;

  // Validasi input
  if (!name) {
    alert("Nama transaksi tidak boleh kosong.");
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    alert("Jumlah harus berupa angka lebih dari 0.");
    return;
  }
  if (!date) {
    alert("Tanggal tidak boleh kosong.");
    return;
  }

  if (editingIndex !== null) {
    transactions[editingIndex] = { name, amount, category, date };
    editingIndex = null;
    const submitBtn = document.querySelector("#transactionForm button[type='submit']");
    submitBtn.textContent = "Tambah";
    submitBtn.classList.remove("btn-save");
    submitBtn.classList.add("btn-tambah");
  } else {
    transactions.push({ name, amount, category, date });
  }

  saveToStorage();
  this.reset();
  renderTransactions();
});

renderTransactions();
