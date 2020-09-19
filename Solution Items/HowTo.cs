«Аск» — цена, по которой продавец готов продать.
«Бид» — цена, которую готов заплатить покупатель финансового инструмента.

throw new NotImplementedException();
this.Id = SerialIntegerFactory.Make();

Millisecond
Console.WriteLine(DateTime.Now.ToString("HH:mm:ss.fff"));
Microseconds
Console.WriteLine(DateTime.Now.ToString("HH:mm:ss.ffffff"));
Tick
Console.WriteLine(DateTime.Now.ToString("HH:mm:ss.fffffff"));
Console.WriteLine(DateTime.Now.ToString("yyyy.MM.dd HH:mm:ss.fffffff"));
//Console.WriteLine(DateTime.Now.ToString("yyyyMMddHHmmssfffffff"));

var d1 = DateTime.Now;
Console.WriteLine(d1.ToString("yyyy.MM.dd HH:mm:ss.fffffff"));
d1 = d1.AddTicks(1);
Console.WriteLine(d1.ToString("yyyy.MM.dd HH:mm:ss.fffffff"));
2016.01.12 17:12:00.2385833

//пример Parse даты
var str = "2016.04.25 10:03:58.0000001";
var date = DateTime.Parse(str);
var strdate = date.ToString("yyyy.MM.dd HH:mm:ss.fffffff");
strdate
"2016.04.25 10:03:58.0000001"

//пример формата даты
DateTime DateTime = new DateTime(2015, 1, 8);
System.Globalization.CultureInfo ci = System.Globalization.CultureInfo.InvariantCulture;
string result;
result = String.Format("{0:yyyyMMdd,HHmmss}", DateTime.ToString(ci));
Console.WriteLine(result);
result = String.Format("{0:yyyyMMdd,HHmmss}", DateTime);
Console.WriteLine(result);
result = String.Format("{0}", DateTime.ToString("yyyyMMdd,HHmmss"));
Console.WriteLine(result);
result = String.Format("{0}", DateTime);
Console.WriteLine(result);

/// <summary>
/// 9 часов утра какой-то даты Date
/// </summary>
DateTime.Date.AddHours(9);

var a = new List<double>(10) { 0, 10, 20, 30, 40, 50, 60, 70, 80, 90 };
var b = a.Where(x => x < 50).ToList();
var c = a.Where(x => x < 50);
public List<double> foo(List<double> c)
{
    c[0] = 1;
    return c;
}
foo(a)
a
b
c

Microsoft выпустила предварительную версию Visual studio 2015 и .Net 4.6 для разработчиков. В новом C# 6.0 несколько новых возможностей, которые могут облегчить кодинг.

В этой статье рассмотрены новые возможности языка C# 6.0. Скачать новую VS можно по ссылке:
Microsoft Visual Studio Ultimate 2015 Preview

#### Инициализация свойств со значениями

В C# 6.0 мы можем инициализировать свойства со значениями, написав справа от них их значение. Это поможет избежать ошибки с null и пустыми значениями свойства.

Раньше:

public int Id { get; set; }
public string FirstName { get; set; }


Теперь:

public int Id { get; set; } = 1001;
public string FirstName { get; set; } = "Srinivas";


Интерполяция строк

Каждый день нам приходится сталкиваться с конкатенацией строк. Кто-то в основном использует оператор “+”, кто-то — метод string.Format(). Мне лично по душе string.Format(). Но проблемы с ним всем известны: при слишком большом количестве параметров тяжело понимать, что означают каждое число – {1}, {2}, {3}. В C# 6.0 придумали новую возможность, которая должна объединить достоинства обоих методов.

Раньше:

name = string.Format("Employee name is {0}, located at {1}", emp.FirstName, emp.Location); 


Теперь:

name = $"Employee name is {emp.FirstName}, located at {emp.Location}";



По просьбе трудящихся IL код


IL_0000: nop
IL_0001: ldstr "Ivan"
IL_0006: stloc.0
IL_0007: ldstr "Moscow"
IL_000c: stloc.1
IL_000d: ldstr "Employee name is {0}, located at {1}"
IL_0012: ldloc.0
IL_0013: ldloc.1
IL_0014: call string [mscorlib]System.String::Format(string, object, object)
IL_0019: stloc.2
IL_001a: ret


Так же можно использовать условия:

name = $"Employee name is {emp.FirstName}, located at {emp.Location}. Age of employee is 
{(emp.Age > 0) ? emp.Age.ToString() : "N/A"}"; 



#### Использование лямбда-выражений

В C# 6.0 свойства и методы можно определять через лямбда-выражения. Это сильно уменьшает количество кода.

Раньше:

public string[] GetCountryList()
{
   return new string[] { "Russia", "USA", "UK" };
} 


Теперь:

public string[] GetCountryList() => new string[] { "Russia", "USA", "UK" };  



Импорт статических классов

Все статические члены к