/* Taller de Electrones · datos del Módulo 1
   Todo el contenido que se muestra en las escenas y listas vive acá. */

/* ---------- Lección 1: elementos para el modelo de átomo ---------- */
const ELEMENTOS = [
  {s:'H', n:'Hidrógeno', z:1,  a:1,   capas:[1], tipo:'aislante',
   txt:'Tiene 1 electrón de valencia, pero no conduce: el hidrógeno es un gas de moléculas H₂, donde dos átomos comparten sus electrones en un enlace y ninguno queda libre. Tener pocos electrones de valencia ayuda, pero también importa cómo se unen los átomos.'},
  {s:'C', n:'Carbono',   z:6,  a:12,  capas:[2,4], tipo:'semiconductor',
   txt:'4 electrones de valencia, como el silicio. Todo depende de cómo se ordenen sus átomos: como diamante es aislante; como grafito (la mina del lápiz) conduce, porque le queda un electrón suelto por átomo. Las resistencias de carbón aprovechan eso.'},
  {s:'O', n:'Oxígeno',   z:8,  a:16,  capas:[2,6], tipo:'aislante',
   txt:'6 electrones de valencia: le faltan 2 para completar su capa de 8. En vez de soltar electrones, los atrapa. Por eso los materiales con mucho oxígeno (vidrio, cerámica, óxidos) suelen ser aislantes, y por eso un contacto oxidado hace falso contacto.'},
  {s:'Ne',n:'Neón',      z:10, a:20,  capas:[2,8], tipo:'gas',
   txt:'Su capa externa está completa, con 8 electrones. No quiere dar ni recibir: es muy estable y aislante. Los carteles de neón brillan solo cuando se les aplica un voltaje muy alto.'},
  {s:'Na',n:'Sodio',     z:11, a:23,  capas:[2,8,1], tipo:'conductor',
   txt:'Igual que el cobre, tiene 1 electrón de valencia y conduce muy bien. Pero reacciona violentamente con el agua y el aire, así que no sirve para hacer cables. Lo conocés en la sal de mesa.'},
  {s:'Al',n:'Aluminio',  z:13, a:27,  capas:[2,8,3], tipo:'conductor',
   txt:'3 electrones de valencia que suelta con facilidad. Es buen conductor, liviano y barato: se usa en líneas de alta tensión, disipadores de calor y carcasas.'},
  {s:'Si',n:'Silicio',   z:14, a:28,  capas:[2,8,4], tipo:'semiconductor',
   txt:'4 electrones de valencia, y los usa todos para unirse con 4 vecinos. A temperatura ambiente casi no le quedan electrones libres, pero con un poco de energía (calor, luz) algunos se sueltan. Es la base de diodos, transistores, chips y paneles solares.'},
  {s:'Cu',n:'Cobre',     z:29, a:64,  capas:[2,8,18,1], tipo:'conductor',
   txt:'Un solo electrón de valencia, lejos del núcleo y “tapado” por 28 electrones internos. Queda casi suelto: por eso el cobre es el conductor de los cables y de las pistas de las placas.'},
  {s:'Ag',n:'Plata',     z:47, a:108, capas:[2,8,18,18,1], tipo:'conductor',
   txt:'Un solo electrón de valencia, igual que el cobre (están en la misma columna de la tabla). Es el mejor conductor que existe, pero es caro y se ennegrece con el aire.'},
  {s:'Au',n:'Oro',       z:79, a:197, capas:[2,8,18,32,18,1], tipo:'conductor',
   txt:'Un solo electrón de valencia, misma columna que el cobre y la plata. Conduce un poco peor que ellos, pero no se oxida nunca: ideal para contactos, conectores y los hilos finísimos dentro de los chips.'},
];

/* ---------- Lección 3: materiales de la red 3D ---------- */
const MATERIALES = [
  {id:'plata',n:'Plata',tipo:'conductor',col:[0xd9dfe8],css:'#d9dfe8',rho:1.59e-8,libres:1,coll:3.8,
   nota:'Cada átomo aporta 1 electrón libre y los choques son pocos. Es el mejor conductor que existe.'},
  {id:'cobre',n:'Cobre',tipo:'conductor',col:[0xe3874f],css:'#e3874f',rho:1.68e-8,libres:1,coll:4.0,
   nota:'1 electrón libre por átomo. Casi tan bueno como la plata y mucho más barato: el de todos los cables.'},
  {id:'oro',n:'Oro',tipo:'conductor',col:[0xf1c24b],css:'#f1c24b',rho:2.44e-8,libres:1,coll:5.8,
   nota:'1 electrón libre por átomo, pero chocan algo más que en el cobre. Se usa porque no se oxida.'},
  {id:'aluminio',n:'Aluminio',tipo:'conductor',col:[0xb9c3cf],css:'#b9c3cf',rho:2.65e-8,libres:3,coll:19,
   nota:'Aporta 3 electrones por átomo, pero chocan muchísimo más. El resultado: conduce un poco peor que el cobre.'},
  {id:'silicio',n:'Silicio',tipo:'semiconductor',col:[0x8b98b8],css:'#8b98b8',rho:2.3e3,coll:6,
   nota:'Cada átomo se une a 4 vecinos compartiendo sus 4 electrones. Solo el calor o la luz liberan algunos. Puro conduce muy poco; en la industria se le agregan impurezas (“dopado”) para controlarlo.'},
  {id:'vidrio',n:'Vidrio',tipo:'aislante',col:[0x9fb3d1,0xff6b6b],css:'#9fe0d6',rho:[1e11,1e15],
   nota:'Silicio (gris) unido a oxígeno (rojo), sin un orden fijo. El oxígeno retiene los electrones con fuerza: no queda ninguno libre.'},
  {id:'goma',n:'Goma',tipo:'aislante',col:[0x6f6862,0xf2f2f2],css:'#6f6862',rho:[1e13,1e13],
   nota:'Largas cadenas de carbono (oscuro) e hidrógeno (blanco). Todos los electrones están ocupados en enlaces. Por eso recubre cables y mangos de herramientas.'},
  {id:'madera',n:'Madera seca',tipo:'aislante',col:[0xa0714a,0xff6b6b],css:'#a0714a',rho:[1e14,1e16],
   nota:'Celulosa: carbono, oxígeno e hidrógeno enlazados. Seca aísla muy bien; mojada conduce, porque el agua con sales disueltas sí tiene cargas libres.'},
];

/* ---------- Lección 2: tabla periódica ---------- */
const TABLA_TXT = 'H,Hidrógeno;He,Helio;Li,Litio;Be,Berilio;B,Boro;C,Carbono;N,Nitrógeno;O,Oxígeno;F,Flúor;Ne,Neón;Na,Sodio;Mg,Magnesio;Al,Aluminio;Si,Silicio;P,Fósforo;S,Azufre;Cl,Cloro;Ar,Argón;K,Potasio;Ca,Calcio;Sc,Escandio;Ti,Titanio;V,Vanadio;Cr,Cromo;Mn,Manganeso;Fe,Hierro;Co,Cobalto;Ni,Níquel;Cu,Cobre;Zn,Zinc;Ga,Galio;Ge,Germanio;As,Arsénico;Se,Selenio;Br,Bromo;Kr,Kriptón;Rb,Rubidio;Sr,Estroncio;Y,Itrio;Zr,Circonio;Nb,Niobio;Mo,Molibdeno;Tc,Tecnecio;Ru,Rutenio;Rh,Rodio;Pd,Paladio;Ag,Plata;Cd,Cadmio;In,Indio;Sn,Estaño;Sb,Antimonio;Te,Telurio;I,Yodo;Xe,Xenón;Cs,Cesio;Ba,Bario;La,Lantano;Ce,Cerio;Pr,Praseodimio;Nd,Neodimio;Pm,Prometio;Sm,Samario;Eu,Europio;Gd,Gadolinio;Tb,Terbio;Dy,Disprosio;Ho,Holmio;Er,Erbio;Tm,Tulio;Yb,Iterbio;Lu,Lutecio;Hf,Hafnio;Ta,Tantalio;W,Wolframio;Re,Renio;Os,Osmio;Ir,Iridio;Pt,Platino;Au,Oro;Hg,Mercurio;Tl,Talio;Pb,Plomo;Bi,Bismuto;Po,Polonio;At,Astato;Rn,Radón;Fr,Francio;Ra,Radio;Ac,Actinio;Th,Torio;Pa,Protactinio;U,Uranio;Np,Neptunio;Pu,Plutonio;Am,Americio;Cm,Curio;Bk,Berkelio;Cf,Californio;Es,Einstenio;Fm,Fermio;Md,Mendelevio;No,Nobelio;Lr,Laurencio;Rf,Rutherfordio;Db,Dubnio;Sg,Seaborgio;Bh,Bohrio;Hs,Hasio;Mt,Meitnerio;Ds,Darmstatio;Rg,Roentgenio;Cn,Copernicio;Nh,Nihonio;Fl,Flerovio;Mc,Moscovio;Lv,Livermorio;Ts,Teneso;Og,Oganesón';

const METALOIDES = [5,14,32,33,51,52,85];          // B Si Ge As Sb Te At
const NO_METALES = [1,6,7,8,9,15,16,17,34,35,53];   // H C N O F P S Cl Se Br I
const GASES_NOBLES = [2,10,18,36,54,86,118];

/* Conductividad eléctrica aproximada a 20 °C, en millones de siemens por metro (MS/m) */
const CONDUCTIVIDAD = {Ag:62.9,Cu:59.6,Au:41.0,Al:37.7,Ca:29.8,Mg:22.8,Na:21.0,Mo:18.7,W:17.9,Zn:16.9,Co:16.0,Ni:14.3,K:13.9,Li:10.8,Fe:10.3,Pt:9.4,Sn:9.2,Cr:8.0,Pb:4.6,Ti:2.4,Hg:1.0};

/* Dónde aparece cada elemento en la electrónica y en la vida diaria */
const USOS = {
  H:'Forma el agua. Es un gas aislante.', He:'Globos y enfriamiento de imanes superconductores.',
  Li:'Baterías de celulares y notebooks (ion-litio).', B:'Se agrega al silicio para hacerlo “tipo P” (dopado).',
  C:'Grafito de lápices y resistencias de carbón (conduce); diamante (aislante).',
  N:'78 % del aire. Se usa como gas protector al soldar.', O:'21 % del aire. Forma óxidos, vidrio y cerámica, que aíslan.',
  F:'Teflón (PTFE), uno de los mejores aislantes de cables especiales.', Ne:'Carteles luminosos y lámparas testigo.',
  Na:'Sal de mesa. En lámparas de sodio del alumbrado público.', Mg:'Carcasas y aleaciones livianas.',
  Al:'Líneas de alta tensión, disipadores, carcasas y capacitores electrolíticos.',
  Si:'Chips, transistores, diodos y paneles solares. También en el vidrio (como óxido).',
  P:'Se agrega al silicio para hacerlo “tipo N” (dopado).', S:'Vulcanizado de la goma.',
  Cl:'Forma parte del PVC, el plástico aislante de la mayoría de los cables.', Ar:'Gas de relleno en lámparas y en soldadura TIG.',
  K:'Esencial para los nervios: tu cuerpo usa iones de potasio para mandar señales eléctricas.', Ca:'Huesos, cal y cemento.',
  Ti:'Carcasas resistentes y livianas.', Cr:'Cromado de piezas; aleación níquel-cromo de resistencias calefactoras.',
  Fe:'Acero; núcleos de transformadores y motores.', Co:'Cátodos de baterías de litio.',
  Ni:'Baterías recargables, niquelado de contactos, alambre de resistencias.',
  Cu:'Cables, bobinas, pistas de las placas de circuito.', Zn:'Pilas y galvanizado contra la corrosión.',
  Ga:'LEDs y chips de carga rápida (nitruro y arseniuro de galio).', Ge:'Los primeros transistores (1947) eran de germanio.',
  As:'Arseniuro de galio: LEDs, láseres y chips de radiofrecuencia de celulares.', Se:'Antiguos rectificadores y fotocopiadoras.',
  Ag:'El mejor conductor. Contactos de relés, soldaduras y pastas conductoras.', In:'ITO (óxido de indio y estaño): la capa conductora transparente de las pantallas táctiles.',
  Sn:'Soldadura electrónica (estaño con plata y cobre).', Sb:'Se mezcla en aleaciones de plomo y en semiconductores.',
  Te:'Paneles solares de telururo de cadmio.', I:'Desinfectantes.', Ta:'Capacitores de tantalio, muy usados en placas de celulares.',
  Nd:'Imanes de neodimio: parlantes, auriculares y motores de vibración.', W:'Filamentos de lámparas y electrodos de soldadura (punto de fusión altísimo).',
  Pt:'Sensores de temperatura y contactos.', Au:'Contactos, conectores, tarjetas SIM e hilos dentro de los chips.',
  Hg:'Termómetros y lámparas antiguas. Tóxico.', Pb:'Soldadura antigua y baterías de auto. Tóxico.',
  U:'Combustible nuclear.', Xe:'Faros de auto y flashes de cámaras.', Kr:'Lámparas especiales.', Mo:'Contactos y electrodos.'
};

function categoriaTabla(z){
  if(GASES_NOBLES.includes(z)) return 'gas';
  if(METALOIDES.includes(z))   return 'semiconductor';
  if(NO_METALES.includes(z))   return 'aislante';
  return 'conductor';
}
/* Columna (1–18) y fila de cada elemento. Lantánidos y actínidos van en las filas 9 y 10. */
function posicionTabla(z){
  if(z===1) return [1,1];
  if(z===2) return [18,1];
  if(z<=10) return [z<=4 ? z-2 : z+8, 2];
  if(z<=18) return [z<=12 ? z-10 : z, 3];
  if(z<=36) return [z-18, 4];
  if(z<=54) return [z-36, 5];
  if(z<=56) return [z-54, 6];
  if(z<=71) return [z-54, 9];   // La(57)→3 … Lu(71)→17
  if(z<=86) return [z-68, 6];
  if(z<=88) return [z-86, 7];
  if(z<=103) return [z-86, 10]; // Ac(89)→3 … Lr(103)→17
  return [z-100, 7];
}
function valenciaTabla(z,col,fila){
  if(fila>=9) return null;
  if(col===1) return 1;
  if(col===2) return 2;
  if(col>=13) return z===2 ? 2 : col-10;
  return null; // metales de transición: 1 o 2 en la última capa
}
const TABLA = TABLA_TXT.split(';').map((par,i)=>{
  const [s,n]=par.split(','); const z=i+1; const [col,fila]=posicionTabla(z);
  return {z,s,n,col,fila,cat:categoriaTabla(z),val:valenciaTabla(z,col,fila),cond:CONDUCTIVIDAD[s]||null,uso:USOS[s]||null};
});

/* ---------- Lección 5: resistividad de materiales reales (Ω·m, 20 °C) ---------- */
const CHART = [
  {n:'Plata',tipo:'conductor',v:1.59e-8,m:'plata'},
  {n:'Cobre',tipo:'conductor',v:1.68e-8,m:'cobre'},
  {n:'Oro',tipo:'conductor',v:2.44e-8,m:'oro'},
  {n:'Aluminio',tipo:'conductor',v:2.65e-8,m:'aluminio'},
  {n:'Hierro',tipo:'conductor',v:9.7e-8},
  {n:'Nicromo',tipo:'conductor',v:1.1e-6,d:'resistencias calefactoras'},
  {n:'Grafito',tipo:'conductor',v:[2.5e-6,5e-6]},
  {n:'Agua de mar',tipo:'intermedio',v:0.2},
  {n:'Agua de la canilla',tipo:'intermedio',v:[20,2000]},
  {n:'Silicio puro',tipo:'semiconductor',v:2.3e3,m:'silicio'},
  {n:'Agua destilada',tipo:'intermedio',v:1.8e5},
  {n:'Vidrio',tipo:'aislante',v:[1e11,1e15],m:'vidrio'},
  {n:'Goma',tipo:'aislante',v:1e13,m:'goma'},
  {n:'Madera seca',tipo:'aislante',v:[1e14,1e16],m:'madera'},
  {n:'Aire',tipo:'aislante',v:[1.3e16,3.3e16]},
];

/* ---------- Autoevaluación ---------- */
const PREGUNTAS = [
  {l:1,q:'¿Qué partículas tienen carga negativa?',o:['Los protones','Los neutrones','Los electrones'],c:2,
   e:'Los electrones son negativos (−), los protones positivos (+) y los neutrones no tienen carga.'},
  {l:1,q:'Un átomo de cobre pierde su electrón de valencia. ¿Cómo queda?',o:['Neutro, porque sigue teniendo 29 protones','Como un ion positivo (Cu⁺): 29 protones y 28 electrones','Como un ion negativo, porque perdió un electrón'],c:1,
   e:'Queda un protón “sin compensar”, así que la carga total es +1. Un átomo con carga se llama ion. Perder electrones → ion positivo.'},
  {l:1,q:'¿Por qué el electrón de valencia del cobre está tan flojo?',o:['Porque está lejos del núcleo y los 28 electrones internos le tapan casi toda la atracción','Porque el cobre tiene pocos protones','Porque gira más rápido que los demás'],c:0,
   e:'La distancia y el “escudo” de electrones internos hacen que sienta una atracción muy débil. Con muy poca energía se suelta.'},
  {l:2,q:'En la tabla periódica, ¿qué indica el número de fila (período)?',o:['La cantidad de capas de electrones','La cantidad de neutrones','Si el elemento es sólido o gas'],c:0,
   e:'Fila 1 = 1 capa, fila 4 = 4 capas. El cobre está en la fila 4 y tiene 4 capas: 2 · 8 · 18 · 1.'},
  {l:2,q:'¿Dónde están los metales (conductores) en la tabla periódica?',o:['Solo en la última columna','A la izquierda y en el centro: son la gran mayoría','Arriba a la derecha'],c:1,
   e:'Más de 90 de los 118 elementos son metales. Los no metales (aislantes) se agrupan arriba a la derecha, y los metaloides (semiconductores) forman una “escalera” entre ambos.'},
  {l:2,q:'Cobre, plata y oro están en la misma columna (grupo 11). ¿Qué tienen en común?',o:['El mismo color','Un solo electrón en la última capa','La misma cantidad de protones'],c:1,
   e:'Los elementos de una misma columna tienen la última capa parecida. Por eso los tres son los mejores conductores.'},
  {l:3,q:'Cuando circula corriente por un cable, ¿qué es lo que se mueve?',o:['Los protones del cobre','Los átomos de cobre enteros','Los electrones libres'],c:2,
   e:'Los iones (núcleos con sus electrones internos) quedan fijos en la red. Solo avanzan los electrones libres.'},
  {l:3,q:'Le aplicás un voltaje normal a un trozo de goma. ¿Qué pasa con sus electrones?',o:['Se corren un poquito dentro de sus enlaces, pero no se van','Salen todos hacia el polo +','Desaparecen'],c:0,
   e:'Están ocupados en los enlaces. Se desplazan un poco (polarización) pero no hay electrones libres que formen corriente.'},
  {l:3,q:'Si calentás un cable de cobre, ¿qué pasa con su resistencia?',o:['Baja, porque se liberan más electrones','Sube un poco, porque los átomos vibran más y los electrones chocan más','No cambia nada'],c:1,
   e:'En los metales, más temperatura = más choques = más resistencia. En el silicio pasa al revés: el calor libera portadores.'},
  {l:3,q:'¿Qué tan rápido avanzan los electrones dentro de un cable con corriente?',o:['Casi a la velocidad de la luz','Muy lento: fracciones de milímetro por segundo','A unos 100 km/h'],c:1,
   e:'Avanzan lentísimo (≈ 0,07 mm/s en un cable de 1 mm² con 1 A). Lo que viaja rápido es el “empujón”, porque el cable ya está lleno de electrones.'},
  {l:4,q:'En un semiconductor, ¿qué es un “hueco”?',o:['Un agujero físico en el material','El lugar vacío que deja un electrón al soltarse; se comporta como una carga positiva','Un electrón con mucha energía'],c:1,
   e:'Cuando un electrón sale de su enlace, deja un faltante. Otro electrón vecino puede ocupar ese lugar, y así el hueco “se mueve” como si fuera una carga +.'},
  {l:4,q:'Según el modelo de bandas, ¿por qué el vidrio no conduce?',o:['Porque no tiene electrones','Porque la brecha entre bandas es enorme (≈ 9 eV) y los electrones no pueden saltarla','Porque es transparente'],c:1,
   e:'Tiene muchísimos electrones, pero todos en la banda de valencia. Para llegar a la de conducción necesitarían una energía que ni el calor ni los voltajes normales les dan.'},
  {l:5,q:'¿Por qué el agua de la canilla conduce y el agua destilada casi no?',o:['Por la temperatura','Porque la de la canilla tiene sales disueltas que forman iones libres','Porque la destilada tiene menos electrones'],c:1,
   e:'El agua pura es mala conductora. Lo que conduce son los iones de las sales disueltas. Por eso el agua común y la piel mojada son peligrosas cerca de la electricidad.'},
  {l:5,q:'¿Por qué los contactos de una tarjeta SIM están bañados en oro, si el cobre conduce mejor?',o:['Porque el oro no se oxida y mantiene un buen contacto con los años','Porque el oro es el mejor conductor','Porque es más barato'],c:0,
   e:'El cobre se oxida y el óxido aísla. El oro conduce un poco menos, pero su superficie se mantiene limpia.'},
];

/* ---------- Glosario ---------- */
const GLOSARIO = [
  ['Átomo','La unidad más pequeña de un elemento. Tiene un núcleo (protones y neutrones) y electrones alrededor.'],
  ['Núcleo','Centro del átomo. Contiene casi toda su masa en un espacio unas 25.000 veces más chico que el átomo.'],
  ['Protón','Partícula del núcleo con carga positiva (+). Su cantidad (número atómico Z) define qué elemento es.'],
  ['Neutrón','Partícula del núcleo sin carga. Ayuda a mantener unido el núcleo.'],
  ['Electrón','Partícula muy liviana con carga negativa (−). Es la protagonista de la electricidad.'],
  ['Carga eléctrica','Propiedad de las partículas. Cargas opuestas se atraen; cargas iguales se repelen.'],
  ['Número atómico (Z)','Cantidad de protones. En un átomo neutro, también es la cantidad de electrones.'],
  ['Capa','Nivel alrededor del núcleo donde se ubican los electrones. Admite como máximo 2, 8, 18, 32… electrones.'],
  ['Electrón de valencia','Electrón de la última capa. Es el que participa en los enlaces y el que puede quedar libre.'],
  ['Ion','Átomo con carga porque ganó (ion −) o perdió (ion +) electrones.'],
  ['Electrón libre','Electrón que no pertenece a ningún átomo y puede moverse por el material. Forma la corriente.'],
  ['Mar de electrones','Modelo de los metales: iones positivos fijos rodeados de electrones libres compartidos.'],
  ['Red cristalina','Ordenamiento regular y repetido de los átomos en un sólido, como el cobre o el silicio.'],
  ['Enlace covalente','Unión entre átomos que comparten electrones. Esos electrones quedan “ocupados” y no conducen.'],
  ['Conductor','Material con muchos electrones libres. Deja pasar la corriente con facilidad (cobre, plata, oro, aluminio).'],
  ['Aislante','Material casi sin electrones libres. Impide el paso de la corriente (goma, vidrio, plástico, madera seca).'],
  ['Semiconductor','Material intermedio (silicio, germanio). Conduce poco, pero su conducción se puede controlar con calor, luz o impurezas.'],
  ['Hueco','Lugar vacío que deja un electrón al soltarse de un enlace. Se comporta como una carga positiva que se mueve.'],
  ['Dopado','Agregar pequeñas cantidades de otro elemento al silicio para darle electrones (tipo N) o huecos (tipo P) de más.'],
  ['Corriente eléctrica','Movimiento ordenado de cargas. En los metales, electrones libres que avanzan hacia el polo positivo.'],
  ['Voltaje','El “empuje” que hace mover a las cargas. Lo vas a ver a fondo con la ley de Ohm.'],
  ['Resistividad (ρ)','Cuánto se opone un material al paso de la corriente. Se mide en ohm por metro (Ω·m).'],
  ['Polarización','Leve desplazamiento de los electrones de un aislante cuando se le aplica voltaje, sin que se suelten.'],
  ['Banda de valencia','Conjunto de niveles de energía de los electrones que están en enlaces.'],
  ['Banda de conducción','Niveles de energía de los electrones libres, que pueden conducir.'],
  ['Brecha prohibida','Energía que separa la banda de valencia de la de conducción. Grande en aislantes, chica en semiconductores, nula en conductores.'],
  ['Electronvoltio (eV)','Unidad de energía muy chica, cómoda para electrones: la que gana un electrón al atravesar 1 voltio.'],
  ['Ruptura dieléctrica','Cuando un voltaje enorme arranca electrones incluso de un aislante y lo hace conducir, como el aire en un rayo.'],
];

/* ---------- Lección 5: dónde aparece cada tipo de material ---------- */
const EJEMPLOS = [
  {t:'Un cable', p:'El caso más simple: un conductor para llevar la corriente y un aislante para que no se escape ni te toque.',
   partes:[['conductor','Cobre','los hilos por donde circula la corriente'],['aislante','PVC','la vaina de plástico que lo recubre']]},
  {t:'La placa de un celular', p:'Una placa es un “sándwich” de varias capas de cobre separadas por material aislante.',
   partes:[['conductor','Cobre','pistas finísimas que conectan los componentes'],['aislante','Fibra de vidrio con resina (FR-4)','la base rígida de la placa'],['conductor','Oro','baño de contactos y conectores, para que no se oxiden']]},
  {t:'Un chip', p:'Los tres tipos de material trabajando juntos en un espacio de pocos milímetros.',
   partes:[['semiconductor','Silicio','miles de millones de transistores'],['conductor','Cobre','conexiones internas entre transistores'],['aislante','Dióxido de silicio','capas aislantes entre conexiones']]},
  {t:'La soldadura', p:'La aleación sin plomo más común se funde a unos 220 °C.',
   partes:[['conductor','Estaño con plata y cobre','une los componentes a la placa y conduce entre ellos']]},
  {t:'Herramientas de electricista', p:'Las certificadas (marca “1000 V”) están probadas para aislar hasta 1000 voltios.',
   partes:[['conductor','Acero','la punta que trabaja'],['aislante','Goma o plástico','el mango que te protege']]},
  {t:'Un panel solar', p:'Aplica directamente lo que viste en bandas de energía: la luz hace saltar electrones.',
   partes:[['semiconductor','Silicio','la luz libera electrones y huecos'],['conductor','Plata','las líneas finas del frente que recogen la corriente'],['aislante','Vidrio','protege y deja pasar la luz']]},
  {t:'Una línea de alta tensión', p:'Los cables van desnudos: el aislante es el aire que los rodea.',
   partes:[['conductor','Aluminio (con alma de acero)','cables livianos y resistentes'],['aislante','Vidrio o cerámica','los aisladores que los cuelgan de la torre'],['aislante','Aire','separa los cables entre sí y del suelo']]},
  {t:'Una pantalla táctil', p:'Un caso raro y genial: un conductor transparente.',
   partes:[['conductor','ITO (óxido de indio y estaño)','capa conductora invisible que detecta tu dedo'],['aislante','Vidrio','la superficie que tocás']]},
];

const MITOS = [
  ['Los aislantes no tienen electrones.','Tienen muchísimos. Lo que no tienen son electrones <strong>libres</strong>: todos están ocupados en enlaces.'],
  ['Los electrones corren por el cable a la velocidad de la luz.','Avanzan despacito (fracciones de milímetro por segundo). Lo que viaja rapidísimo es el <strong>empujón</strong>, porque el cable ya está lleno de electrones.'],
  ['El agua conduce la electricidad.','El agua <strong>pura</strong> casi no conduce: lo que conduce son las sales disueltas (iones). Pero el agua común siempre tiene sales, así que agua y electricidad = peligro.'],
  ['La madera es aislante, así que es segura.','Solo la madera <strong>seca</strong>. Húmeda o mojada conduce lo suficiente como para ser peligrosa.'],
  ['Un aislante nunca conduce.','Con un voltaje suficientemente alto, cualquier aislante se rompe y conduce (<strong>ruptura dieléctrica</strong>). Por eso los cables indican el voltaje máximo que soportan.'],
  ['En un cable también se mueven los protones.','Los protones están en los núcleos, fijos en la red. En un metal <strong>solo se mueven los electrones libres</strong>.'],
];

const IDEAS = [
  ['Todo está hecho de átomos','Un núcleo con protones (+) y neutrones, y electrones (−) alrededor, ordenados en capas.'],
  ['Opuestos se atraen','El núcleo positivo sujeta a los electrones negativos. Cuanto más cerca, más fuerte.'],
  ['La última capa manda','Los electrones de valencia deciden si un material conduce: 1 a 3 → conductor, 4 → semiconductor, 5 a 8 → aislante.'],
  ['Ion = átomo con carga','Si pierde electrones queda positivo (Cu⁺); si gana, negativo.'],
  ['La tabla lo resume','Fila = cantidad de capas. Columna = última capa parecida. Metales a la izquierda y el centro, no metales arriba a la derecha, metaloides en la escalera.'],
  ['Conductores: mar de electrones','Los metales sueltan sus electrones de valencia, que quedan libres. Los mejores: plata, cobre, oro y aluminio.'],
  ['Aislantes: electrones ocupados','Todos sus electrones están en enlaces. Sin electrones libres, no hay corriente.'],
  ['Semiconductores: depende','Conducen poco, pero el calor o la luz liberan electrones y dejan huecos. Base de chips y paneles solares.'],
  ['Corriente = avance ordenado','Con voltaje, los electrones libres avanzan en promedio hacia el +. Lento, pero todos a la vez.'],
  ['El calor, al revés','En los metales, más temperatura = más resistencia. En los semiconductores, más temperatura = menos resistencia.'],
  ['Bandas de energía','Sin brecha → conductor. Brecha chica (1,1 eV) → semiconductor. Brecha enorme (≈ 9 eV) → aislante.'],
];

/* Temas que siguen en el curso (se suman como módulos nuevos) */
const PROXIMOS = ['¿Cómo es el flujo de los electrones?','La ley de Ohm: voltaje, corriente y resistencia','¿Qué es la potencia?','¿Qué es un circuito electrónico?','AC y DC: voltaje alterno y continuo','¿Qué son los sistemas métricos?'];
