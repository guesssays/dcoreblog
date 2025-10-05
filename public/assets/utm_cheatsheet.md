# UTM-шпаргалка с рабочими примерами

## Базовый шаблон
`?utm_source=instagram&utm_medium=cpc&utm_campaign={{offer}}&utm_content={{story|reel|post|adset}}&utm_term={{audience}}`

## Ключевые правила
- `utm_source` — платформа: instagram, telegram, google, yandex.
- `utm_medium` — способ: cpc, organic, referral, email.
- `utm_campaign` — оффер или продукт. Только латиница, `-` вместо пробелов.
- `utm_content` — формат или креатив: story, reel, post, banner1, adset_a.
- `utm_term` — аудитория/ключ. Для платного трафика — сегмент или интерес.

## Примеры
1) Сториз с акцией:
```
https://dcore.uz/landing?utm_source=instagram&utm_medium=organic&utm_campaign=diagnostika-0-som&utm_content=story&utm_term=followers
```
2) Таргет по интересу стоматология:
```
https://dcore.uz/landing?utm_source=instagram&utm_medium=cpc&utm_campaign=implant-proposal&utm_content=adset_reel&utm_term=dental_interest
```

## Типичные ошибки и как их исправить
- Ошибка: разные написания одного и того же значения.
  Решение: согласованный словарь значений + автоподстановка из пресетов.
- Ошибка: отсутствие UTM в шапке и закрепах.
  Решение: единая ссылка с UTM-базой + динамические параметры.
- Ошибка: UTM не передается в CRM.
  Решение: скрытые поля на форме и прокидывание параметров из URL.

## Как прокинуть UTM в форму (пример)
Скрипт берет параметры из URL и заполняет скрытые поля `utm_*`, а также `page_url`. Совместим с Netlify/CRM.
