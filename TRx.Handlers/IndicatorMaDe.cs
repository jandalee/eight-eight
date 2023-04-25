using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TRL.Common;
using TRL.Common.Collections;
using TRL.Common.Extensions.Collections;
using TRL.Common.Data;
using TRL.Common.Extensions.Data;
using TRL.Common.Handlers;
using TRL.Common.Models;
using TRL.Logging;
using TRL.Common.TimeHelpers;
using TRL.Common.Events;
using TRx.Indicators;
using TRx.Helpers;
using TRL.Common.Extensions;

namespace TRx.Handlers
{
    /// <summary>
    /// Обработчик появления новых данных
    /// Вычисляет среднюю за период
    /// Вычисляет отклонение источника от средней за период
    /// 
    /// Возможные изменения:
    /// Модифицировать генерацию события
    /// Модифицировать обработчик - добавить параметр конструктора тип скользящей
    /// </summary>
    public class IndicatorMaDe//: AddedItemHandler<Bar>
                               : DataOutput<double>
    {
        //TODO 3. Добавить в индикатор Имя и Номер
        public IDataInput<double> Input { get; private set; }
        //public IList<double> Value { get; private set; }

        //private StrategyHeader strategyHeader { get; set; }
        //private IDataContext tradingData { get; set; }
        //private ObservableQueue<Signal> signalQueue { get; set; }
        private ILogger logger { get; set; }
        
        /// <summary>
        /// скользящее среднее
        /// </summary>
        public IList<double> Ma { get;} = new List<double>();
        /// <summary>
        /// отклонение цены от скользящей средней
        /// </summary>
        public IList<double> De { get; } = new List<double>();

        /// <summary>
        /// значения для отправки, отрисовки
        /// скользящее среднее
        /// </summary>
        public IList<ValueDouble> ValueMa { get; } = new List<ValueDouble>();
        /// <summary>
        /// значения для отправки, отрисовки
        /// отклонение цены от скользящей средней
        /// </summary>
        public IList<ValueDouble> ValueDe { get; } = new List<ValueDouble>();

        /// <summary>
        /// список сторонних обработчиков Ma
        /// </summary>
        private IList<ItemAddedNotification<double>> HandlersMa { get; set; }
           = new List<ItemAddedNotification<double>>();
        /// <summary>
        /// список сторонних обработчиков De
        /// </summary>
        private IList<ItemAddedNotification<double>> HandlersDe { get; set; } 
           = new List<ItemAddedNotification<double>>();

        /// <summary>
        /// список сторонних обработчиков ValueMa
        /// </summary>
        private IList<ItemAddedNotification<ValueDouble>> HandlersValueMa { get; set; } 
           = new List<ItemAddedNotification<ValueDouble>>();
        /// <summary>
        /// список сторонних обработчиков ValueDe
        /// </summary>
        private IList<ItemAddedNotification<ValueDouble>> HandlersValueDe { get; set; } 
           = new List<ItemAddedNotification<ValueDouble>>();

        //private BarSettings bs { get; set; }

        //public Bar bar { get; private set; }
        //private SMASettings ss { get; set; }
        /// <summary>
        /// период скользящей средней цены
        /// </summary>
        public double Period { get; private set; }
        //public IndicatorMACDx(StrategyHeader strategyHeader, IDataContext tradingData, double period, ILogger logger)
        //    //: base(tradingData.Get<ObservableCollection<Bar>>())
        //{
        //    this.strategyHeader = strategyHeader;
        //    this.tradingData = tradingData;
        //    //this.signalQueue = signalQueue;
        //    this.logger = logger;
        //    //ma period
        //    this.Period = period;

        //    this.HandlersMa = new List<ItemAddedNotification<double>>();
        //    this.HandlersDe = new List<ItemAddedNotification<double>>();

        //    this.HandlersValueMa = new List<ItemAddedNotification<ValueDouble>>();
        //    this.HandlersValueDe = new List<ItemAddedNotification<ValueDouble>>();

        //    this.Ma =