// Tabel Tarif Efektif Rata-Rata (TER) PPh 21 berdasarkan PP No. 58 Tahun 2023
// Referensi dari dokumen PDF

type TERBracket = { max: number; rate: number };

const TERA: TERBracket[] = [
  { max: 5400000, rate: 0.00 },
  { max: 5650000, rate: 0.0025 },
  { max: 5950000, rate: 0.0050 },
  { max: 6300000, rate: 0.0075 },
  { max: 6750000, rate: 0.0100 },
  { max: 7500000, rate: 0.0125 },
  { max: 8550000, rate: 0.0150 },
  { max: 9650000, rate: 0.0175 },
  { max: 10050000, rate: 0.0200 },
  { max: 10350000, rate: 0.0225 },
  { max: 10700000, rate: 0.0250 },
  { max: 11050000, rate: 0.0300 },
  { max: 11600000, rate: 0.0350 },
  { max: 12500000, rate: 0.0400 },
  { max: 13750000, rate: 0.0500 },
  { max: 15100000, rate: 0.0600 },
  { max: 16950000, rate: 0.0700 },
  { max: 19750000, rate: 0.0800 },
  { max: 24150000, rate: 0.0900 },
  { max: 26450000, rate: 0.1000 },
  { max: 28000000, rate: 0.1100 },
  { max: 30050000, rate: 0.1200 },
  { max: 32400000, rate: 0.1300 },
  { max: 35400000, rate: 0.1400 },
  { max: 39100000, rate: 0.1500 },
  { max: 43850000, rate: 0.1600 },
  { max: 47800000, rate: 0.1700 },
  { max: 51400000, rate: 0.1800 },
  { max: 56300000, rate: 0.1900 },
  { max: 62200000, rate: 0.2000 },
  { max: 68600000, rate: 0.2100 },
  { max: 77500000, rate: 0.2200 },
  { max: 89000000, rate: 0.2300 },
  { max: 103000000, rate: 0.2400 },
  { max: 125000000, rate: 0.2500 },
  { max: 157000000, rate: 0.2600 },
  { max: 206000000, rate: 0.2700 },
  { max: 337000000, rate: 0.2800 },
  { max: 454000000, rate: 0.2900 },
  { max: 550000000, rate: 0.3000 },
  { max: 695000000, rate: 0.3100 },
  { max: 910000000, rate: 0.3200 },
  { max: 1400000000, rate: 0.3300 },
  { max: Infinity, rate: 0.3400 }
];

const TERB: TERBracket[] = [
  { max: 6200000, rate: 0.0000 },
  { max: 6500000, rate: 0.0025 },
  { max: 6850000, rate: 0.0050 },
  { max: 7300000, rate: 0.0075 },
  { max: 9200000, rate: 0.0100 },
  { max: 10750000, rate: 0.0150 },
  { max: 11250000, rate: 0.0200 },
  { max: 11600000, rate: 0.0250 },
  { max: 12600000, rate: 0.0300 },
  { max: 13600000, rate: 0.0400 },
  { max: 14950000, rate: 0.0500 },
  { max: 16400000, rate: 0.0600 },
  { max: 18450000, rate: 0.0700 },
  { max: 21850000, rate: 0.0800 },
  { max: 26000000, rate: 0.0900 },
  { max: 27700000, rate: 0.1000 },
  { max: 29350000, rate: 0.1100 },
  { max: 31450000, rate: 0.1200 },
  { max: 33950000, rate: 0.1300 },
  { max: 37100000, rate: 0.1400 },
  { max: 41100000, rate: 0.1500 },
  { max: 45800000, rate: 0.1600 },
  { max: 49500000, rate: 0.1700 },
  { max: 53800000, rate: 0.1800 },
  { max: 58500000, rate: 0.1900 },
  { max: 64000000, rate: 0.2000 },
  { max: 71000000, rate: 0.2100 },
  { max: 80000000, rate: 0.2200 },
  { max: 93000000, rate: 0.2300 },
  { max: 109000000, rate: 0.2400 },
  { max: 129000000, rate: 0.2500 },
  { max: 163000000, rate: 0.2600 },
  { max: 211000000, rate: 0.2700 },
  { max: 374000000, rate: 0.2800 },
  { max: 459000000, rate: 0.2900 },
  { max: 555000000, rate: 0.3000 },
  { max: 704000000, rate: 0.3100 },
  { max: 957000000, rate: 0.3200 },
  { max: 1405000000, rate: 0.3300 },
  { max: Infinity, rate: 0.3400 }
];

const TERC: TERBracket[] = [
  { max: 6600000, rate: 0.0000 },
  { max: 6950000, rate: 0.0025 },
  { max: 7350000, rate: 0.0050 },
  { max: 7800000, rate: 0.0075 },
  { max: 8850000, rate: 0.0100 },
  { max: 9800000, rate: 0.0125 },
  { max: 10950000, rate: 0.0150 },
  { max: 11200000, rate: 0.0175 },
  { max: 12050000, rate: 0.0200 },
  { max: 12950000, rate: 0.0300 },
  { max: 14150000, rate: 0.0400 },
  { max: 15550000, rate: 0.0500 },
  { max: 17050000, rate: 0.0600 },
  { max: 19500000, rate: 0.0700 },
  { max: 22700000, rate: 0.0800 },
  { max: 26600000, rate: 0.0900 },
  { max: 28100000, rate: 0.1000 },
  { max: 30100000, rate: 0.1100 },
  { max: 32600000, rate: 0.1200 },
  { max: 35400000, rate: 0.1300 },
  { max: 38900000, rate: 0.1400 },
  { max: 43000000, rate: 0.1500 },
  { max: 47400000, rate: 0.1600 },
  { max: 51200000, rate: 0.1700 },
  { max: 55800000, rate: 0.1800 },
  { max: 60400000, rate: 0.1900 },
  { max: 66700000, rate: 0.2000 },
  { max: 74500000, rate: 0.2100 },
  { max: 83200000, rate: 0.2200 },
  { max: 95600000, rate: 0.2300 },
  { max: 110000000, rate: 0.2400 },
  { max: 134000000, rate: 0.2500 },
  { max: 169000000, rate: 0.2600 },
  { max: 221000000, rate: 0.2700 },
  { max: 390000000, rate: 0.2800 },
  { max: 463000000, rate: 0.2900 },
  { max: 561000000, rate: 0.3000 },
  { max: 709000000, rate: 0.3100 },
  { max: 965000000, rate: 0.3200 },
  { max: 1419000000, rate: 0.3300 },
  { max: Infinity, rate: 0.3400 }
];

export function getTERCategory(taxStatus: string | null): 'A' | 'B' | 'C' | null {
  if (!taxStatus) return null;

  // Extract only the code part (before space or parenthesis)
  // Example: "TK/0 (Tidak Kawin, 0 Tanggungan)" -> "TK/0"
  const code = taxStatus.trim().split(/[\s(]/)[0].toUpperCase();

  // TER A: TK/0, TK/1, K/0 atau TK0, TK1, K0
  if (['TK/0', 'TK/1', 'K/0', 'TK0', 'TK1', 'K0'].includes(code)) return 'A';

  // TER B: TK/2, TK/3, K/1, K/2 atau TK2, TK3, K1, K2
  if (['TK/2', 'TK/3', 'K/1', 'K/2', 'TK2', 'TK3', 'K1', 'K2'].includes(code)) return 'B';

  // TER C: K/3 atau K3
  if (['K/3', 'K3'].includes(code)) return 'C';

  return null;
}

export function calculatePPh21(grossSalary: number, taxStatus: string | null): number {
  if (grossSalary <= 0) return 0;
  
  const category = getTERCategory(taxStatus);
  if (!category) return 0; // Kalo status pajak kosong atau ga valid, ga potong PPh21
  
  let brackets: TERBracket[] = [];
  if (category === 'A') brackets = TERA;
  else if (category === 'B') brackets = TERB;
  else if (category === 'C') brackets = TERC;
  
  // Cari bracket yang sesuai
  const bracket = brackets.find(b => grossSalary <= b.max);
  if (!bracket) return 0;
  
  // Hitung pajak
  return Math.round(grossSalary * bracket.rate);
}
