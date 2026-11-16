"""Romanization in the same style as the app's existing data (e.g. "Ya rabótayu v shkóle.")."""
ACUTE = "́"
VOW = "аеёиоуыэюяАЕЁИОУЫЭЮЯ"
BASE = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "ж": "zh", "з": "z", "и": "i", "й": "y",
    "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t",
    "у": "u", "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch", "ъ": "", "ы": "y",
    "ь": "'", "э": "e",
}
IOT = {"е": ("ye", "e"), "ё": ("yo", "yo"), "ю": ("yu", "yu"), "я": ("ya", "ya")}
ACC = {"a": "á", "e": "é", "i": "í", "o": "ó", "u": "ú", "y": "ý"}


def roma(text):
    out = []
    chars = list(text)
    prev = " "
    for i, ch in enumerate(chars):
        if ch == ACUTE:
            continue
        stressed = i + 1 < len(chars) and chars[i + 1] == ACUTE
        low = ch.lower()
        if low in IOT:
            initial = (not prev.isalpha()) or prev.lower() in VOW or prev.lower() in "ьъ"
            r = IOT[low][0] if initial else IOT[low][1]
            if low == "е" and not initial:
                r = "e"
        elif low in BASE:
            r = BASE[low]
        else:
            r = ch
        if stressed:
            # put the acute on the vowel letter of r (last vowel letter)
            for j in range(len(r) - 1, -1, -1):
                if r[j] in ACC:
                    r = r[:j] + ACC[r[j]] + r[j + 1:]
                    break
        if ch.isupper() and r:
            r = r[0].upper() + r[1:]
        out.append(r)
        prev = ch
    return "".join(out)


def strip(text):
    return text.replace(ACUTE, "")


if __name__ == "__main__":
    for t in ["Я рабо́таю в шко́ле.", "Мы начина́ем встре́чу.", "До́брый день", "Мы живём здесь.", "нужда́ться", "Мы начнём в сле́дующем ме́сяце."]:
        print(roma(t))
