/**
 * Maps Windows code pages to encoding names.
 * @see https://docs.microsoft.com/en-us/windows/win32/intl/code-page-identifiers
 * @see https://www.iana.org/assignments/character-sets/character-sets.xhtml
 */
module.exports = {
  '037': 'IBM037',
  '437': 'IBM437', // IANA
  '500': 'IBM500',
  '708': 'ISO-8859-6', // IANA, ASMO-708
  '709': 'ASMO_449', // IANA
  '710': '',
  '720': 'DOS-720',
  '737': 'IBM737',
  '775': 'IBM775', // IANA
  '850': 'IBM850', // IANA
  '852': 'IBM852', // IANA
  '855': 'IBM855', // IANA
  '857': 'IBM857', // IANA
  '858': 'IBM00858', // IANA
  '860': 'IBM860', // IANA
  '861': 'IBM861', // IANA
  '862': 'DOS-862',
  '863': 'IBM863', // IANA
  '864': 'IBM864', // IANA
  '865': 'IBM865', // IANA
  '866': 'IBM866', // IANA
  '869': 'IBM869', // IANA
  '874': 'windows-874', // IANA
  '875': 'cp875',
  '932': 'Shift_JIS', // IANA
  '936': 'GBK', // IANA, GB2312
  '949': 'EUC-KR', // IANA, ISO-2022-KR, KS_C_5601-1987
  '950': 'Big5', // IANA
  '1026': 'IBM1026', // IANA
  '1140': 'IBM01140', // IANA
  '1141': 'IBM01141', // IANA
  '1142': 'IBM01142', // IANA
  '1143': 'IBM01143', // IANA
  '1144': 'IBM01144', // IANA
  '1145': 'IBM01145', // IANA
  '1146': 'IBM01146', // IANA
  '1147': 'IBM01147', // IANA
  '1148': 'IBM01148', // IANA
  '1149': 'IBM01149', // IANA
  '1200': 'UTF-16', // IANA, UTF-16LE
  '1201': 'UTF-16BE', // IANA
  '1250': 'windows-1250', // IANA
  '1251': 'windows-1251', // IANA
  '1252': 'windows-1252', // IANA
  '1253': 'windows-1253', // IANA
  '1254': 'windows-1254', // IANA
  '1255': 'windows-1255', // IANA
  '1256': 'windows-1256', // IANA
  '1257': 'windows-1257', // IANA
  '1258': 'windows-1258', // IANA
  '1361': 'Johab',
  '10000': 'macintosh', // IANA
  '10001': 'x-mac-japanese',
  '10002': 'x-mac-chinesetrad',
  '10003': 'x-mac-korean',
  '10004': 'x-mac-arabic',
  '10005': 'x-mac-hebrew',
  '10006': 'x-mac-greek',
  '10007': 'x-mac-cyrillic',
  '10008': 'x-mac-chinesesimp',
  '10010': 'x-mac-romanian',
  '10017': 'x-mac-ukrainian',
  '10021': 'x-mac-thai',
  '10029': 'x-mac-ce',
  '10079': 'x-mac-icelandic',
  '10081': 'x-mac-turkish',
  '10082': 'x-mac-croatian',
  '12000': 'UTF-32', // IANA, UTF-32LE
  '12001': 'UTF-32BE', // IANA
  '20000': 'x-Chinese-CNS',
  '20001': 'x-cp20001',
  '20002': 'x-Chinese-Eten',
  '20003': 'x-cp20003',
  '20004': 'x-cp20004',
  '20005': 'x-cp20005',
  '20105': 'x-IA5',
  '20106': 'x-IA5-German',
  '20107': 'x-IA5-Swedish',
  '20108': 'x-IA5-Norwegian',
  '20127': 'US-ASCII',
  '20261': 'x-cp20261',
  '20269': 'x-cp20269',
  '20273': 'IBM273', // IANA
  '20277': 'IBM277', // IANA
  '20278': 'IBM278', // IANA
  '20280': 'IBM280', // IANA
  '20284': 'IBM284', // IANA
  '20285': 'IBM285', // IANA
  '20290': 'IBM290', // IANA
  '20297': 'IBM297', // IANA
  '20420': 'IBM420', // IANA
  '20423': 'IBM423', // IANA
  '20424': 'IBM424', // IANA
  '20833': 'x-EBCDIC-KoreanExtended',
  '20838': 'IBM-Thai', // IANA
  '20866': 'KOI8-R', // IANA
  '20871': 'IBM871', // IANA
  '20880': 'IBM880', // IANA
  '20905': 'IBM905', // IANA
  '20924': 'IBM00924', // IANA
  '20932': 'EUC-JP', // IANA
  '20936': 'GBK', // IANA, GB2312, x-cp20936
  '20949': 'x-cp20949',
  '21025': 'cp1025',
  '21027': '',
  '21866': 'KOI8-U', // IANA
  '28591': 'ISO-8859-1', // IANA
  '28592': 'ISO-8859-2', // IANA
  '28593': 'ISO-8859-3', // IANA
  '28594': 'ISO-8859-4', // IANA
  '28595': 'ISO-8859-5', // IANA
  '28596': 'ISO-8859-6', // IANA
  '28597': 'ISO-8859-7', // IANA
  '28598': 'ISO-8859-8', // IANA
  '28599': 'ISO-8859-9', // IANA
  '28603': 'ISO-8859-13', // IANA
  '28605': 'ISO-8859-15', // IANA
  '38598': 'ISO-8859-8-I', // IANA
  '50220': 'ISO-2022-JP', // IANA
  '50221': 'ISO-2022-JP', // IANA
  '50225': 'ISO-2022-KR', // IANA
  '50227': 'ISO-2022-CN', // x-cp50227
  '50229': '',
  '50930': '',
  '50931': '',
  '50933': '',
  '50935': '',
  '50936': '',
  '50937': '',
  '50939': '',
  '51932': 'EUC-JP', // IANA
  '51936': 'EUC-CN',
  '51949': 'EUC-KR', // IANA
  '51950': '',
  '52936': 'HZ-GB-2312', // IANA
  '54936': 'GB18030', // IANA
  '57002': 'x-iscii-de',
  '57003': 'x-iscii-be',
  '57004': 'x-iscii-ta',
  '57005': 'x-iscii-te',
  '57006': 'x-iscii-as',
  '57007': 'x-iscii-or',
  '57008': 'x-iscii-ka',
  '57009': 'x-iscii-ma',
  '57010': 'x-iscii-gu',
  '57011': 'x-iscii-pa',
  '65000': 'UTF-7', // IANA
  '65001': 'UTF-8', // IANA
};
