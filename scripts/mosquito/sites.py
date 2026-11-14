"""Survey sites of the Tokyo mosquito surveillance, with the weather stations used for each.

Coordinates are a representative point of each park (the traps' own positions are
not published). n_traps: the published counts are the sum over this many traps.
"""

SITES = [
    # key, survey, name_ja, name_en, region, municipality, lat, lon, n_traps
    ("oi", "kouiki", "大井ふ頭中央海浜公園", "Oi Futo Chuo Kaihin Park", "区部", "品川区", 35.5885, 139.7530, 1),
    ("odaiba", "kouiki", "お台場海浜公園", "Odaiba Kaihin Park", "区部", "港区", 35.6297, 139.7752, 1),
    ("aoyama", "kouiki", "青山霊園", "Aoyama Cemetery", "区部", "港区", 35.6682, 139.7226, 1),
    ("yanaka", "kouiki", "谷中霊園", "Yanaka Cemetery", "区部", "台東区", 35.7240, 139.7698, 1),
    ("somei", "kouiki", "染井霊園", "Somei Cemetery", "区部", "豊島区", 35.7353, 139.7421, 1),
    ("shakujii", "kouiki", "石神井公園", "Shakujii Park", "区部", "練馬区", 35.7365, 139.5995, 1),
    ("toneri", "kouiki", "舎人公園", "Toneri Park", "区部", "足立区", 35.7960, 139.7700, 1),
    ("kinuta", "kouiki", "砧公園", "Kinuta Park", "区部", "世田谷区", 35.6310, 139.6275, 1),
    ("inokashira", "kouiki", "井の頭恩賜公園", "Inokashira Park", "多摩", "武蔵野市・三鷹市", 35.7000, 139.5735, 1),
    ("tamazoo", "kouiki", "多摩動物公園", "Tama Zoological Park", "多摩", "日野市", 35.6490, 139.4022, 1),
    ("sayama", "kouiki", "狭山公園", "Sayama Park", "多摩", "東村山市", 35.7605, 139.4380, 1),
    ("oyamada", "kouiki", "小山田緑地", "Oyamada Ryokuchi", "多摩", "町田市", 35.5850, 139.4180, 1),
    ("hachioji", "kouiki", "八王子霊園", "Hachioji Cemetery", "多摩", "八王子市", 35.6475, 139.2740, 1),
    ("yakuyo", "kouiki", "東京都薬用植物園", "Tokyo Medicinal Plant Garden", "多摩", "小平市", 35.7322, 139.4645, 1),
    ("jindai", "kouiki", "神代植物公園", "Jindai Botanical Garden", "多摩", "調布市", 35.6705, 139.5490, 1),
    ("mizuho", "kouiki", "瑞穂農芸高等学校", "Mizuho Nogei High School", "多摩", "瑞穂町", 35.7712, 139.3540, 1),
    ("yoyogi", "juuten", "代々木公園", "Yoyogi Park", "区部", "渋谷区", 35.6717, 139.6949, 10),
    ("hibiya", "juuten", "日比谷公園", "Hibiya Park", "区部", "千代田区", 35.6735, 139.7560, 5),
    ("hamarikyu", "juuten", "浜離宮恩賜庭園", "Hama-rikyu Gardens", "区部", "中央区", 35.6600, 139.7633, 5),
    ("toyama", "juuten", "戸山公園", "Toyama Park", "区部", "新宿区", 35.7035, 139.7115, 5),
    ("ueno", "juuten", "上野恩賜公園", "Ueno Park", "区部", "台東区", 35.7148, 139.7730, 5),
    ("komazawa", "juuten", "駒沢オリンピック公園", "Komazawa Olympic Park", "区部", "世田谷区", 35.6252, 139.6612, 5),
    ("hikarigaoka", "juuten", "光が丘公園", "Hikarigaoka Park", "区部", "練馬区", 35.7610, 139.6295, 5),
    ("sarue", "juuten", "猿江恩賜公園", "Sarue Onshi Park", "区部", "江東区", 35.6880, 139.8143, 5),
    ("kasai", "juuten", "葛西臨海公園", "Kasai Rinkai Park", "区部", "江戸川区", 35.6415, 139.8618, 5),
]

# Name variants printed in some years -> the site they belong to
ALIASES = {"odaiba_rainbow": ("odaiba", "2021年度はお台場レインボー公園で調査")}

# JMA stations (prec_no 44 = Tokyo). has: which daily values the station reports.
STATIONS = [
    # id, kind (s = observatory, a = AMeDAS), name, lat, lon, has
    ("47662", "s", "東京", 35.6917, 139.7500, "tpwh"),
    ("1002", "a", "練馬", 35.7383, 139.5917, "tpwh"),
    ("0368", "a", "世田谷", 35.6267, 139.6200, "p"),
    ("0370", "a", "江戸川臨海", 35.6383, 139.8633, "tpwh"),
    ("0371", "a", "羽田", 35.5533, 139.7800, "tpw"),
    ("1133", "a", "府中", 35.6833, 139.4833, "tpwh"),
    ("0366", "a", "八王子", 35.6667, 139.3167, "tpwh"),
    ("1001", "a", "青梅", 35.7883, 139.3117, "tpwh"),
]
