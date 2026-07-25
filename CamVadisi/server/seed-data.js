/**
 * ILK KURULUM TOHUMU - tek gercek kaynak DEGIL.
 *
 * Yedigul'de ogrenilen ders: bu dosyayi sonradan duzenlemek CANLIYI DEGISTIRMEZ.
 * Menu yayina girdikten sonra her degisiklik yonetim panelinden yapilir.
 *
 * Icerik yer tutucudur; fiyatlar ve urunler isletmeyle teyit edilmemistir.
 * Ceviriler tek seferlik uretilmistir (kullanici karari, 2026-07-24).
 *
 * Fiyatlar KURUS cinsindendir: 45000 = 450 ₺
 */

export const seedSettings = {
  restaurant_name: 'Çam Vadisi',
  announcement: 'Bugün fırında kuzu tandır var.',
  announcement_en: 'Slow-roasted lamb is on today.',
  announcement_ar: 'لدينا اليوم لحم ضأن مشوي في الفرن.',
  announcement_ru: 'Сегодня у нас запечённая баранина.',
  announcement_active: '1',
  wifi_password: 'camvadisi2026',
  hours: JSON.stringify([
    { day: 'Pazartesi - Cuma', open: '08:00', close: '22:00' },
    { day: 'Cumartesi - Pazar', open: '08:00', close: '23:00' },
  ]),
};

export const seedCategories = [
  {
    slug: 'kahvalti',
    timeStart: '08:00',
    timeEnd: '12:00',
    name: { tr: 'Kahvaltı', en: 'Breakfast', ar: 'الفطور', ru: 'Завтрак' },
    products: [
      {
        name: { tr: 'Serpme Kahvaltı', en: 'Spread Breakfast', ar: 'فطور مفتوح', ru: 'Турецкий завтрак' },
        description: {
          tr: 'Köy peyniri, tereyağı, süzme bal, kekikli zeytin ve közde domates.',
          en: 'Village cheese, butter, strained honey, thyme olives and fire-roasted tomato.',
          ar: 'جبن قروي، زبدة، عسل مصفّى، زيتون بالزعتر وطماطم مشوية.',
          ru: 'Деревенский сыр, масло, мёд, оливки с чабрецом и печёные томаты.',
        },
        ingredients: {
          tr: 'Beyaz peynir, tulum peyniri, tereyağı, bal, kaymak, zeytin, domates, salatalık, köy yumurtası, ev reçeli.',
          en: 'White cheese, tulum cheese, butter, honey, clotted cream, olives, tomato, cucumber, village eggs, homemade jam.',
        },
        tags: ['vegetarian', 'dairy'],
        variants: [{ name: { tr: 'Kişi başı', en: 'Per person', ar: 'للشخص', ru: 'На человека' }, price: 45000 }],
      },
      {
        name: { tr: 'Menemen', en: 'Menemen', ar: 'منمن', ru: 'Менемен' },
        description: {
          tr: 'Tereyağında, köy yumurtası ve sivri biberle.',
          en: 'Cooked in butter with village eggs and green peppers.',
          ar: 'مطبوخ بالزبدة مع بيض بلدي وفلفل أخضر.',
          ru: 'На сливочном масле, с деревенскими яйцами и перцем.',
        },
        ingredients: { tr: 'Köy yumurtası, domates, sivri biber, tereyağı, tuz.' },
        tags: ['vegetarian', 'dairy'],
        basePrice: 22000,
      },
      {
        name: { tr: 'Sahanda Sucuklu Yumurta', en: 'Eggs with Sucuk', ar: 'بيض مع السجق', ru: 'Яичница с суджуком' },
        description: {
          tr: 'Sahanda pişmiş yumurta ve dilimlenmiş sucuk.',
          en: 'Pan-fried eggs with sliced Turkish sausage.',
          ar: 'بيض مقلي مع شرائح السجق.',
          ru: 'Яичница с ломтиками суджука.',
        },
        basePrice: 26000,
      },
      {
        name: { tr: 'Kaymaklı Bal', en: 'Honey with Clotted Cream', ar: 'عسل مع القشطة', ru: 'Мёд со сливками' },
        description: {
          tr: 'Yayla balı ve manda kaymağı.',
          en: 'Highland honey with buffalo clotted cream.',
          ar: 'عسل جبلي مع قشطة الجاموس.',
          ru: 'Горный мёд с буйволиными сливками.',
        },
        tags: ['vegetarian', 'dairy', 'gluten_free'],
        basePrice: 18000,
      },
      {
        name: { tr: 'Gözleme', en: 'Gözleme', ar: 'كوزلمه', ru: 'Гёзлеме' },
        description: {
          tr: 'Sacda pişen el açması yufka.',
          en: 'Hand-rolled flatbread cooked on a griddle.',
          ar: 'عجين مفرود يدويًا يُخبز على الصاج.',
          ru: 'Тонкая лепёшка ручной раскатки, на садже.',
        },
        ingredients: { tr: 'El açması yufka, tereyağı; iç harcı seçime göre değişir.' },
        tags: ['dairy'],
        variants: [
          { name: { tr: 'Peynirli', en: 'Cheese', ar: 'بالجبن', ru: 'С сыром' }, price: 12000 },
          { name: { tr: 'Patatesli', en: 'Potato', ar: 'بالبطاطا', ru: 'С картофелем' }, price: 11000 },
          { name: { tr: 'Kıymalı', en: 'Minced meat', ar: 'باللحم المفروم', ru: 'С фаршем' }, price: 15000 },
        ],
      },
      {
        name: { tr: 'Sigara Böreği', en: 'Cheese Rolls', ar: 'بورك بالجبن', ru: 'Сигара-бёрек' },
        description: {
          tr: 'Peynirli, kızarmış ince yufka.',
          en: 'Crisp thin pastry filled with cheese.',
          ar: 'رقائق مقرمشة محشوة بالجبن.',
          ru: 'Хрустящие рулетики с сыром.',
        },
        tags: ['vegetarian', 'dairy'],
        basePrice: 14000,
      },
    ],
  },
  {
    slug: 'mangal',
    timeStart: '12:00',
    timeEnd: '22:00',
    name: { tr: 'Mangal', en: 'From the Grill', ar: 'المشاوي', ru: 'Гриль' },
    products: [
      {
        name: { tr: 'Kuzu Pirzola', en: 'Lamb Chops', ar: 'ريش الضأن', ru: 'Бараньи рёбрышки' },
        description: {
          tr: 'Meşe kömüründe pişirilir; közlenmiş biber ve tereyağlı pilav ile.',
          en: 'Grilled over oak charcoal, served with roasted peppers and buttered rice.',
          ar: 'مشوية على فحم البلوط، تُقدَّم مع الفلفل المشوي والأرز بالزبدة.',
          ru: 'На дубовых углях, с печёным перцем и рисом.',
        },
        ingredients: {
          tr: 'Kuzu pirzola, tereyağı, kaya tuzu, karabiber, kekik, közlenmiş kırmızı biber, pirinç, tel şehriye.',
          en: 'Lamb chops, butter, rock salt, black pepper, thyme, roasted red pepper, rice, vermicelli.',
        },
        tags: ['dairy'],
        variants: [
          { name: { tr: 'Yarım porsiyon (3 parça)', en: 'Half (3 pieces)', ar: 'نصف (٣ قطع)', ru: 'Половина (3 шт.)' }, price: 48000 },
          { name: { tr: 'Tam porsiyon (6 parça)', en: 'Full (6 pieces)', ar: 'كامل (٦ قطع)', ru: 'Полная (6 шт.)' }, price: 89000 },
        ],
      },
      {
        name: { tr: 'Adana Kebap', en: 'Adana Kebab', ar: 'كباب أضنة', ru: 'Аданa кебаб' },
        description: {
          tr: 'Zırhta çekilmiş kuzu, közde domates ve soğan piyazı ile.',
          en: 'Hand-minced lamb with fire-roasted tomato and onion salad.',
          ar: 'لحم ضأن مفروم يدويًا مع طماطم مشوية وسلطة بصل.',
          ru: 'Рубленая баранина, печёные томаты и луковый салат.',
        },
        ingredients: { tr: 'Kuzu eti, kuyruk yağı, acı pul biber, tuz.' },
        tags: ['spicy'],
        basePrice: 38000,
      },
      {
        name: { tr: 'Urfa Kebap', en: 'Urfa Kebab', ar: 'كباب أورفة', ru: 'Урфа кебаб' },
        description: {
          tr: 'Acısız; közde domates ve soğan piyazı ile.',
          en: 'Mild version, with roasted tomato and onion salad.',
          ar: 'غير حار، مع طماطم مشوية وسلطة بصل.',
          ru: 'Неострый, с печёными томатами и луком.',
        },
        basePrice: 38000,
      },
      {
        name: { tr: 'Tavuk Şiş', en: 'Chicken Skewer', ar: 'شيش دجاج', ru: 'Куриный шиш' },
        description: {
          tr: 'Gece boyu terbiyelenmiş tavuk göğsü.',
          en: 'Chicken breast marinated overnight.',
          ar: 'صدر دجاج متبّل طوال الليل.',
          ru: 'Куриная грудка ночного маринования.',
        },
        basePrice: 32000,
      },
      {
        name: { tr: 'Izgara Köfte', en: 'Grilled Meatballs', ar: 'كفتة مشوية', ru: 'Котлеты на гриле' },
        description: {
          tr: 'El yapımı, kekikli; yanında közlenmiş sebze.',
          en: 'Handmade with thyme, served with grilled vegetables.',
          ar: 'محضّرة يدويًا بالزعتر، مع خضار مشوية.',
          ru: 'Ручной работы с чабрецом, с овощами гриль.',
        },
        basePrice: 34000,
        isSoldOut: true,
      },
      {
        name: { tr: 'Kuzu Şiş', en: 'Lamb Skewer', ar: 'شيش ضأن', ru: 'Бараний шиш' },
        description: {
          tr: 'Kuzu kuşbaşı, közde biber ile.',
          en: 'Cubed lamb with roasted peppers.',
          ar: 'مكعبات ضأن مع فلفل مشوي.',
          ru: 'Кусочки баранины с печёным перцем.',
        },
        basePrice: 46000,
      },
      {
        name: { tr: 'Mangalda Sebze', en: 'Grilled Vegetables', ar: 'خضار مشوية', ru: 'Овощи на гриле' },
        description: {
          tr: 'Patlıcan, biber, domates ve mantar.',
          en: 'Aubergine, pepper, tomato and mushroom.',
          ar: 'باذنجان، فلفل، طماطم وفطر.',
          ru: 'Баклажан, перец, томат и грибы.',
        },
        tags: ['vegan', 'gluten_free'],
        basePrice: 22000,
      },
    ],
  },
  {
    slug: 'ara-sicak',
    name: { tr: 'Ara Sıcak', en: 'Hot Starters', ar: 'مقبلات ساخنة', ru: 'Горячие закуски' },
    products: [
      {
        name: { tr: 'Çıtır Kalamar', en: 'Crispy Calamari', ar: 'كالاماري مقرمش', ru: 'Хрустящие кальмары' },
        description: {
          tr: 'Tartar sos ile.',
          en: 'Served with tartar sauce.',
          ar: 'يُقدَّم مع صلصة التارتار.',
          ru: 'С соусом тартар.',
        },
        basePrice: 34000,
      },
      {
        name: { tr: 'Mantar Sote', en: 'Sautéed Mushrooms', ar: 'فطر سوتيه', ru: 'Грибы соте' },
        description: {
          tr: 'Tereyağı ve kekikle sotelenmiş kültür mantarı.',
          en: 'Mushrooms sautéed in butter and thyme.',
          ar: 'فطر مقلي بالزبدة والزعتر.',
          ru: 'Грибы, обжаренные в масле с чабрецом.',
        },
        tags: ['vegetarian', 'dairy'],
        basePrice: 24000,
      },
      {
        name: { tr: 'Patates Kızartması', en: 'Fries', ar: 'بطاطا مقلية', ru: 'Картофель фри' },
        description: { tr: 'Ev usulü, kalın dilim.', en: 'Thick-cut, house style.', ar: 'شرائح سميكة على طريقة البيت.', ru: 'Крупная нарезка, по-домашнему.' },
        tags: ['vegetarian'],
        basePrice: 14000,
      },
      {
        name: { tr: 'Arnavut Ciğeri', en: 'Albanian Liver', ar: 'كبدة ألبانية', ru: 'Печень по-албански' },
        description: {
          tr: 'Kızarmış kuzu ciğeri, soğan piyazı ile.',
          en: 'Fried lamb liver with onion salad.',
          ar: 'كبدة ضأن مقلية مع سلطة البصل.',
          ru: 'Жареная баранья печень с луковым салатом.',
        },
        basePrice: 28000,
      },
    ],
  },
  {
    slug: 'salata-meze',
    name: { tr: 'Salata & Meze', en: 'Salads & Meze', ar: 'سلطات ومزّة', ru: 'Салаты и мезе' },
    products: [
      {
        name: { tr: 'Çoban Salata', en: 'Shepherd Salad', ar: 'سلطة الراعي', ru: 'Пастуший салат' },
        description: {
          tr: 'Domates, salatalık, biber, soğan ve maydanoz.',
          en: 'Tomato, cucumber, pepper, onion and parsley.',
          ar: 'طماطم، خيار، فلفل، بصل وبقدونس.',
          ru: 'Томат, огурец, перец, лук и петрушка.',
        },
        tags: ['vegan', 'gluten_free'],
        basePrice: 16000,
      },
      {
        name: { tr: 'Gavurdağı Salata', en: 'Gavurdağı Salad', ar: 'سلطة غاوورداغ', ru: 'Салат Гавурдаы' },
        description: {
          tr: 'Ceviz, nar ekşisi ve ince doğranmış sebze.',
          en: 'Walnut, pomegranate molasses and finely diced vegetables.',
          ar: 'جوز، دبس الرمان وخضار مفرومة ناعمًا.',
          ru: 'Грецкий орех, гранатовый соус и мелко нарезанные овощи.',
        },
        tags: ['vegan', 'nuts'],
        basePrice: 18000,
      },
      {
        name: { tr: 'Haydari', en: 'Haydari', ar: 'حيدري', ru: 'Хайдари' },
        description: {
          tr: 'Süzme yoğurt, sarımsak ve dereotu.',
          en: 'Strained yoghurt with garlic and dill.',
          ar: 'لبن مصفّى مع الثوم والشبت.',
          ru: 'Процеженный йогурт с чесноком и укропом.',
        },
        tags: ['vegetarian', 'dairy', 'gluten_free'],
        basePrice: 14000,
      },
      {
        name: { tr: 'Acılı Ezme', en: 'Spicy Ezme', ar: 'عزمة حارة', ru: 'Острая эзме' },
        description: {
          tr: 'El ile doğranmış, acı biberli.',
          en: 'Hand-chopped with hot peppers.',
          ar: 'مفرومة يدويًا مع الفلفل الحار.',
          ru: 'Рубленая вручную, с острым перцем.',
        },
        tags: ['vegan', 'spicy', 'gluten_free'],
        basePrice: 14000,
      },
      {
        name: { tr: 'Şakşuka', en: 'Şakşuka', ar: 'شكشوكة', ru: 'Шакшука' },
        description: {
          tr: 'Kızarmış patlıcan ve domates sosu.',
          en: 'Fried aubergine in tomato sauce.',
          ar: 'باذنجان مقلي بصلصة الطماطم.',
          ru: 'Жареный баклажан в томатном соусе.',
        },
        tags: ['vegan'],
        basePrice: 16000,
      },
      {
        name: { tr: 'Mevsim Yeşillik', en: 'Garden Greens', ar: 'خضار الموسم', ru: 'Сезонная зелень' },
        description: {
          tr: 'Roka, marul, tere ve limon.',
          en: 'Rocket, lettuce, cress and lemon.',
          ar: 'جرجير، خس، رشاد وليمون.',
          ru: 'Руккола, салат, кресс и лимон.',
        },
        tags: ['vegan', 'gluten_free'],
        basePrice: 12000,
      },
    ],
  },
  {
    slug: 'tatli',
    name: { tr: 'Tatlı', en: 'Desserts', ar: 'الحلويات', ru: 'Десерты' },
    products: [
      {
        name: { tr: 'Fırın Sütlaç', en: 'Baked Rice Pudding', ar: 'مهلبية الأرز بالفرن', ru: 'Запечённый сютлач' },
        description: {
          tr: 'Odun fırınında üstü kızarmış.',
          en: 'Browned on top in the wood oven.',
          ar: 'محمّرة الوجه في فرن الحطب.',
          ru: 'Подрумяненный в дровяной печи.',
        },
        tags: ['vegetarian', 'dairy', 'gluten_free'],
        basePrice: 14000,
      },
      {
        name: { tr: 'Künefe', en: 'Künefe', ar: 'كنافة', ru: 'Кюнефе' },
        description: {
          tr: 'Sıcak servis edilir, üzeri antep fıstıklı.',
          en: 'Served hot, topped with pistachio.',
          ar: 'تُقدَّم ساخنة مع الفستق الحلبي.',
          ru: 'Подаётся горячей, с фисташкой.',
        },
        tags: ['dairy', 'nuts'],
        basePrice: 19000,
      },
      {
        name: { tr: 'Kabak Tatlısı', en: 'Candied Pumpkin', ar: 'حلوى اليقطين', ru: 'Тыква в сиропе' },
        description: {
          tr: 'Cevizli ve tahinli.',
          en: 'With walnut and tahini.',
          ar: 'مع الجوز والطحينة.',
          ru: 'С грецким орехом и тахини.',
        },
        tags: ['vegetarian', 'nuts'],
        basePrice: 13000,
      },
      {
        name: { tr: 'Dondurma', en: 'Ice Cream', ar: 'مثلجات', ru: 'Мороженое' },
        description: { tr: 'Kaymaklı, sakızlı veya kakaolu.', en: 'Cream, mastic or cocoa.', ar: 'قشطة، مستكة أو كاكاو.', ru: 'Сливочное, мастика или какао.' },
        tags: ['vegetarian', 'dairy'],
        variants: [
          { name: { tr: 'Tek top', en: 'Single scoop', ar: 'كرة واحدة', ru: 'Один шарик' }, price: 6000 },
          { name: { tr: 'Üç top', en: 'Three scoops', ar: 'ثلاث كرات', ru: 'Три шарика' }, price: 15000 },
        ],
      },
    ],
  },
  {
    slug: 'icecek',
    name: { tr: 'İçecek', en: 'Drinks', ar: 'المشروبات', ru: 'Напитки' },
    products: [
      {
        name: { tr: 'Demlik Çay', en: 'Brewed Tea', ar: 'شاي', ru: 'Чай' },
        description: { tr: 'Odun ateşinde demlenir.', en: 'Brewed over a wood fire.', ar: 'يُحضَّر على نار الحطب.', ru: 'Заваривается на дровах.' },
        tags: ['vegan', 'gluten_free'],
        variants: [
          { name: { tr: 'Bardak', en: 'Glass', ar: 'كوب', ru: 'Стакан' }, price: 3000 },
          { name: { tr: 'Semaver (2 kişilik)', en: 'Samovar (for 2)', ar: 'سماور (لشخصين)', ru: 'Самовар (на двоих)' }, price: 12000 },
        ],
      },
      {
        name: { tr: 'Türk Kahvesi', en: 'Turkish Coffee', ar: 'قهوة تركية', ru: 'Турецкий кофе' },
        description: { tr: 'Közde pişirilir.', en: 'Cooked over embers.', ar: 'تُطبخ على الجمر.', ru: 'Готовится на углях.' },
        tags: ['vegan', 'gluten_free'],
        basePrice: 8000,
      },
      {
        name: { tr: 'Ayran', en: 'Ayran', ar: 'عيران', ru: 'Айран' },
        description: { tr: 'Ev yapımı, köpüklü.', en: 'Homemade and frothy.', ar: 'منزلي ورغوي.', ru: 'Домашний, с пенкой.' },
        tags: ['vegetarian', 'dairy', 'gluten_free'],
        basePrice: 5000,
      },
      {
        name: { tr: 'Şalgam', en: 'Turnip Juice', ar: 'عصير اللفت', ru: 'Шалгам' },
        description: { tr: 'Acılı veya acısız.', en: 'Hot or mild.', ar: 'حار أو عادي.', ru: 'Острый или обычный.' },
        tags: ['vegan'],
        basePrice: 5000,
      },
      {
        name: { tr: 'Taze Sıkılmış Portakal Suyu', en: 'Fresh Orange Juice', ar: 'عصير برتقال طازج', ru: 'Свежевыжатый апельсиновый сок' },
        description: { tr: 'Siparişte sıkılır.', en: 'Squeezed to order.', ar: 'يُعصر عند الطلب.', ru: 'Отжимается при заказе.' },
        tags: ['vegan', 'gluten_free'],
        basePrice: 9000,
      },
      {
        name: { tr: 'Maden Suyu', en: 'Sparkling Water', ar: 'مياه معدنية', ru: 'Минеральная вода' },
        description: { tr: 'Sade veya meyveli.', en: 'Plain or fruit flavoured.', ar: 'سادة أو بنكهة الفاكهة.', ru: 'Обычная или с фруктами.' },
        tags: ['vegan', 'gluten_free'],
        basePrice: 4000,
      },
    ],
  },
];
