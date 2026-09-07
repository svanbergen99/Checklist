(()=>{
'use strict';

const subcategories=[
  'Ontzegging van de rij- of vaarbevoegdheid (alleen bij verkeersproducten)',
  'Diefstal, inbraak, verduistering, heling, bedrog, oplichting, valsheid in geschrifte',
  'Vernieling, brandstichting, bedreiging, afpersing, chantage, stalking, gewapende overval',
  'Mishandeling, doodslag, moord',
  'Vrijheidsberoving, mensenhandel',
  'Aanranding, verkrachting, ontucht met minderjarigen, bezit van kinderporno',
  'Bezit of handel in wapens, munitie, vuurwerk',
  'Bezit, kweken, vervaardigen, handelen, doorvoeren of invoeren van drugs',
  'Misdrijven die te maken hebben met terrorisme, witwassen of deelname aan een criminele organisatie',
  'Milieumisdrijven',
  'Alle vormen van fraude en cybercriminaliteit'
];

const sections=[
  {
    key:'step1', title:'STAP 1: Klant identificeren', className:'card',
    items:[
      {id:'check_1_0', text:'Opvragen postcode/huisnummer of klantnummer'},
      {id:'check_1_1', text:'Opvragen voorletter(s)'},
      {id:'check_1_2', text:'Opvragen achternaam'},
      {id:'check_1_3', text:'Opvragen geboortedatum'}
    ]
  },
  {
    key:'step2', title:'STAP 2: Contact- en betaalgegevens', className:'card',
    items:[
      {id:'check_2_0', text:'Opvragen e-mailadres'},
      {id:'check_2_1', text:'Opvragen telefoonnummer'},
      {id:'check_2_2', text:'Opvragen collectiviteit'},
      {id:'check_2_4', text:'Communicatiewijze bespreken: post of digitaal'},
      {id:'check_2_3', text:'Opvragen bankrekening (IBAN/SEPA)'}
    ]
  },
  {
    key:'step3', title:'STAP 3: Aanvraag en afronding', className:'card wide',
    items:[
      {id:'check_3_0', text:'Voorlezen: “We berekenen jouw premie en beoordelen je aanvraag automatisch.” (Automatische besluitvorming)'},
      {id:'check_3_1', text:'Benoem de exacte premie: totale premie'},
      {id:'check_3_1a', text:'Heb je het voertuig zakelijk gekocht of gefinancierd? Of gebruik je het voertuig zakelijk?', vehicleRole:'business'},
      {id:'check_3_1b', html:'<strong>Op welke naam staat het kenteken van het voertuig?</strong>', vehicleRole:'registration'},
      {id:'check_3_2', text:'Bij post benoemen dat de voorwaarden digitaal verstuurd worden. Dit gaat niet via de post.', conditional:'post'},
      {id:'check_3_3', text:'Vragen: “Geeft u Centraal Beheer toestemming om het bedrag van uw rekening af te schrijven?”'}
    ],
    acceptance:[
      {
        heading:'De laatste vragen',
        id:'check_3_4',
        html:'<strong>Laatste vragen</strong><br>“We stellen je een paar vragen om te bekijken of wij je als klant kunnen verzekeren. Ben je niet eerlijk of volledig? Dan kunnen wij de verzekering stoppen en betalen wij je schade niet.”'
      },
      {
        heading:'Acceptatievraag 1',
        id:'check_3_5',
        html:'<strong>Acceptatievraag 1</strong><br>Heeft een verzekeraar in de afgelopen 5 jaar een verzekering van jou of personen die onder deze verzekering vallen, zoals bijvoorbeeld je gezinsleden of huisgenoten, opgezegd of geweigerd?<span class="question-subtext"><strong>Let op:</strong> het gaat niet om verzekeringen die iemand zelf heeft opgezegd.</span>'
      },
      {
        heading:'Acceptatievraag 2',
        id:'check_3_6',
        html:'<strong>Acceptatievraag 2</strong><br>Ben jij of 1 van de personen die je wilt meeverzekeren, voor een strafbaar feit in aanraking geweest met de politie of justitie?<span class="question-subtext"><ul><li>Zaken die ouder zijn dan 8 jaar hoef je niet op te geven.</li><li>Het gaat om aanraking met politie of justitie als verdachte.</li><li>Het gaat om een lopend onderzoek, een veroordeling of de uitvoering van een straf of maatregel.</li></ul></span>',
        answerButtons:true
      },
      {
        id:'check_3_6_sub',
        html:'<strong>Vervolg bij antwoord “Ja”</strong><br>Lees alle onderstaande subcategorieën voor.',
        subcategories,
        conditional:'criminal-yes'
      },
      {
        heading:'Acceptatievraag 3',
        id:'check_3_7',
        html:'<strong>Acceptatievraag 3</strong><br>Heb jij, of 1 van de personen die je wilt meeverzekeren, in de afgelopen 5 jaar schade gemeld op 1 of meerdere verzekeringen?'
      },
      {
        heading:'Afronden',
        id:'check_3_8',
        text:'Vragen of er nog andere vragen zijn'
      }
    ]
  }
];

const strictReadingTargets={
  check_3_4:'We stellen je een paar vragen om te bekijken of wij je als klant kunnen verzekeren. Ben je niet eerlijk of volledig? Dan kunnen wij de verzekering stoppen en betalen wij je schade niet.',
  check_3_5:'Heeft een verzekeraar in de afgelopen 5 jaar een verzekering van jou of personen die onder deze verzekering vallen, zoals bijvoorbeeld je gezinsleden of huisgenoten, opgezegd of geweigerd? Het gaat niet om verzekeringen die iemand zelf heeft opgezegd.',
  check_3_6:'Ben jij of 1 van de personen die je wilt meeverzekeren, voor een strafbaar feit in aanraking geweest met de politie of justitie? Zaken die ouder zijn dan 8 jaar hoef je niet op te geven. Het gaat om aanraking met politie of justitie als verdachte. Het gaat om een lopend onderzoek, een veroordeling of de uitvoering van een straf of maatregel.',
  check_3_6_sub:'Ontzegging van de rij- of vaarbevoegdheid alleen bij verkeersproducten. Diefstal, inbraak, verduistering, heling, bedrog, oplichting, valsheid in geschrifte. Vernieling, brandstichting, bedreiging, afpersing, chantage, stalking, gewapende overval. Mishandeling, doodslag, moord. Vrijheidsberoving, mensenhandel. Aanranding, verkrachting, ontucht met minderjarigen, bezit van kinderporno. Bezit of handel in wapens, munitie, vuurwerk. Bezit, kweken, vervaardigen, handelen, doorvoeren of invoeren van drugs. Misdrijven die te maken hebben met terrorisme, witwassen of deelname aan een criminele organisatie. Milieumisdrijven. Alle vormen van fraude en cybercriminaliteit.',
  check_3_7:'Heb jij, of 1 van de personen die je wilt meeverzekeren, in de afgelopen 5 jaar schade gemeld op 1 of meerdere verzekeringen?',
  check_3_8:'Heeft u nog andere vragen?'
};

const speechRules={
  check_1_0:['postcode','huisnummer','klantnummer'],
  check_1_1:['voorletter','voorletters','initialen'],
  check_1_2:['achternaam','familienaam'],
  check_1_3:['geboortedatum','wanneer bent u geboren'],
  check_2_0:['e-mailadres','emailadres','e mail adres'],
  check_2_1:['telefoonnummer','mobiele nummer'],
  check_2_2:['collectief','collectiviteit'],
  check_2_3:['bankrekening','iban','sepa','rekeningnummer'],
  check_2_4:['communicatiewijze','communicatie wijze','communicatievoorkeur','communicatie voorkeur','wijze staat digitaal','communicatie staat digitaal','wijze is post','wijze is digitaal','post of digitaal'],
  check_3_0:['berekenen jouw premie','beoordelen je aanvraag automatisch','automatische besluitvorming'],
  check_3_1:['exacte premie','totale premie','totaalpremie','de premie is','jouw premie wordt','uw premie wordt'],
  check_3_1a:['zakelijk gekocht','zakelijk gefinancierd','gebruik je','gebruikt u'],
  check_3_1b:['op welke naam staat het kenteken','naam staat het kenteken','kenteken staat op naam'],
  check_3_2:['voorwaarden digitaal','niet via de post','niet per post'],
  check_3_3:['centraal beheer toestemming','bedrag van uw rekening af te schrijven','toestemming om af te schrijven'],
  check_3_4:['betalen wij je schade niet','betalen we je schade niet'],
  check_3_5:['zelf heeft opgezegd','zelf hebben opgezegd'],
  check_3_6:['uitvoering van een straf of maatregel'],
  check_3_6_sub:['fraude en cybercriminaliteit'],
  check_3_7:['een of meerdere verzekeringen','1 of meerdere verzekeringen'],
  check_3_8:['nog andere vragen','heeft u nog vragen','kan ik nog ergens mee helpen']
};

const vehicleObjects=[
  {key:'bestelauto',label:'bestelauto',article:'de',aliases:['bestelauto','bestelwagen']},
  {key:'motor',label:'motor',article:'de',aliases:['motorfiets','motor']},
  {key:'brommer',label:'brommer',article:'de',aliases:['bromfiets','brommer']},
  {key:'snorfiets',label:'snorfiets',article:'de',aliases:['snorfiets']},
  {key:'scooter',label:'scooter',article:'de',aliases:['scooter']},
  {key:'camper',label:'camper',article:'de',aliases:['camper','kampeerauto']},
  {key:'caravan',label:'caravan',article:'de',aliases:['caravan']},
  {key:'aanhanger',label:'aanhanger',article:'de',aliases:['aanhangwagen','aanhanger','trailer']},
  {key:'oldtimer',label:'oldtimer',article:'de',aliases:['oldtimer']},
  {key:'auto',label:'auto',article:'de',aliases:['personenauto','auto','wagen']}
];

const allItems=sections.flatMap(section=>[
  ...(section.items||[]),
  ...(section.acceptance||[])
]);

window.ChecklistData=Object.freeze({
  sections,
  allItems,
  itemById:Object.fromEntries(allItems.map(item=>[item.id,item])),
  strictReadingTargets,
  speechRules,
  vehicleObjects,
  genericVehicleObject:{key:'voertuig',label:'voertuig',article:'het',aliases:[]},
  subcategories
});
})();
