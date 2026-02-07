
import { Lesson, Goals } from './types';

export const DEFAULT_GOALS: Goals = {
  daily: { questions: 100 },
  weekly: { questions: 700 },
  monthly: { questions: 3000 },
  topicGoals: {}
};

export const DEFAULT_LESSONS: Lesson[] = [
  {
    id: 'turkce',
    name: 'Türkçe',
    color: 'bg-indigo-500',
    topics: [
      'Sözcükte Anlam', 'Cümlede Anlam', 'Paragrafın Anlam ve Yapısı', 'Ses Bilgisi', 
      'Yazım Kuralları', 'Noktalama İşaretleri', 'Sözcükte Yapı (Ek-Kök)', 'Sözcük Türleri (İsim, Sıfat, Fiil...)', 
      'Cümle Bilgisi (Ögeler-Türler)', 'Anlatım Bozuklukları', 'Sözel Mantık'
    ]
  },
  {
    id: 'matematik',
    name: 'Matematik',
    color: 'bg-rose-500',
    topics: [
      'Temel Kavramlar', 'Sayı Basamakları', 'Bölme ve Bölünebilme', 'EBOB-EKOK', 
      'Rasyonel Sayılar', 'Basit Eşitsizlikler', 'Mutlak Değer', 'Üslü Sayılar', 
      'Köklü Sayılar', 'Çarpanlara Ayırma', 'I. Dereceden Denklemler', 'Oran-Orantı', 
      'Sayı-Kesir Problemleri', 'Yaş Problemleri', 'İşçi-Havuz Problemleri', 
      'Hareket Problemleri', 'Yüzde-Kar-Zarar Problemleri', 'Karışım Problemleri', 
      'Grafik Problemleri', 'Kümeler ve Kartezyen Çarpım', 'Fonksiyonlar', 
      'Permütasyon-Kombinasyon', 'Olasılık', 'Sayısal Mantık'
    ]
  },
  {
    id: 'geometri',
    name: 'Geometri',
    color: 'bg-amber-500',
    topics: [
      'Geometrik Kavramlar ve Açılar', 'Üçgende Açılar', 'Üçgende Alan', 'Üçgende Benzerlik', 
      'Dik Üçgen ve Trigonometri', 'İkizkenar ve Eşkenar Üçgen', 'Üçgende Açı-Kenar Bağıntıları', 
      'Çokgenler ve Dörtgenler', 'Çember ve Daire', 'Analitik Geometri', 'Katı Cisimler'
    ]
  },
  {
    id: 'tarih',
    name: 'Tarih',
    color: 'bg-emerald-600',
    topics: [
      'İslamiyet Öncesi Türk Tarihi', 'İlk Türk-İslam Devletleri', 'Türkiye Tarihi (1071-1299)', 
      'Osmanlı Devleti Kuruluş ve Yükselme', 'Osmanlı Devleti Duraklama, Gerileme ve Dağılma', 
      'Osmanlı Kültür ve Medeniyeti', 'XX. Yüzyılda Osmanlı Devleti', 'Kurtuluş Savaşı Hazırlık Dönemi', 
      'Kurtuluş Savaşı Cepheler', 'Atatürk İlke ve İnkılapları', 'Atatürk Dönemi Türk Dış Politikası', 
      'Çağdaş Türk ve Dünya Tarihi'
    ]
  },
  {
    id: 'cografya',
    name: 'Coğrafya',
    color: 'bg-cyan-600',
    topics: [
      'Türkiye’nin Coğrafi Konumu', 'Türkiye’nin Yerşekilleri', 'Türkiye’nin İklimi ve Bitki Örtüsü', 
      'Türkiye’de Nüfus ve Yerleşme', 'Türkiye’de Tarım', 'Türkiye’de Hayvancılık', 
      'Türkiye’de Madenler ve Enerji Kaynakları', 'Türkiye’de Sanayi', 'Türkiye’de Ulaşım, Ticaret ve Turizm', 
      'Türkiye’nin Bölgesel Coğrafyası'
    ]
  },
  {
    id: 'vatandaslik',
    name: 'Vatandaşlık',
    color: 'bg-violet-600',
    topics: [
      'Hukukun Temel Kavramları', 'Devlet Biçimleri ve Hükümet Sistemleri', 'Anayasa Tarihi', 
      '1982 Anayasası Temel İlkeler', 'Temel Hak ve Ödevler', 'Yasama', 'Yürütme', 'Yargı', 
      'İdare Hukuku', 'Güncel Bilgiler'
    ]
  }
];
