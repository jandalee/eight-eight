﻿# TRx Algorithmic Trading
## TRx C# Algorithmic Trading and BackTesting Library
TRx C# Algorithmic Trading Library built for desktop.
TRx Trading Library has SmartCOM connect for MOEX market. 

-	TRL - public base core trading library
-	TRx - public indicators & strategies, new extentions, experiments and samples
-	TRS - private strategy
-	TSL - private TSLab indicators & strategies based on TRx

------
Библиотека TRx на языке программирования C# для разработки и тестирования торговых стратегий
для рынков Московской биржи.
http://moex.com/
В бибилиотеке реализован коннектор через SmartCOM для подключения к торговым сервером брокера.
http://www.itinvest.ru/software/smartcom/
Описание API SmartCOM
http://www.itinvest.ru/editorfiles/File/smartcom/SmartCOM_manual_3_0.pdf

-	TRL - базовая открытая часть trading library
-	TRx - открытая часть библиотеки - содержит индикаторы, открытые стратегии - примеры
-	TRS - приватная часть библиотеки - содержит стратегии
-	TSL - приватная часть библиотеки - содержит индикаторы для TSLab

### TRx содержит 3 примера:

| Strategy | BackTest | Program |
| ------------ | ------------- | ------------- |
| TRx.Strategy.Sample1 | TRx.BackTest.Sample1 | TRx.Program.Sample1 |
| TRx.Strategy.Sample2 | TRx.BackTest.Sample2 | TRx.Program.Sample2 |
| TRx.Strategy.Sample3 | TRx.BackTest.Sample3 | TRx.Program.Sample3 |

-	Strategy - сама стратегия
-	Program - боевой режим работы
-	BackTest - сейчас однопроходный бактест

В Strategy пишется сама стратегия 1 раз. 
Затем эта сборка без изменения используется в Program или BackTest,
где меняется только окружение в котом вызывается стратегия.
Параметры стратегии задаются в парметрах приложения.

Sample3 - содержит пример стратегии пересечения 2х скользящих средних.

### Порядок сборки решения, после скачивания с репозитория.
-	После открытия решения будет недоступна приватная часть билиотеки в папках решения TRS и TSL
![Alt text](Solution Items/img-2016-03-16-14-54-02.png?raw=true "Отсутствующие проекты")
-	Правой кнопкой мыши на решении "Восстановить пакеты NuGet"
![Alt text](Solution Items/img-2016-03-16-13-25-40.png?raw=true "Восстановить пакеты NuGet")
-	Правой кнопкой мыши на решении "Собрать решение"
![Alt text](https://github.com/wouldyougo/TRx/blob/master/Solution%20Items/img-2016-03-16-13-26-16.png "Собрать решение")
-	Если что-то из папок External Projects, TRS или TSL мешает сборке решения, это можно выгрузить из решения по кнопке "Выгрузить проект"
