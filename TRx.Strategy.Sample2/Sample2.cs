using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;
using System.Diagnostics;
using System.Threading.Tasks;
//using Microsoft.AspNet.SignalR;
//using Microsoft.Owin.Hosting;

using SmartCOM3Lib;

using TRL.Logging;
using TRL.Common;
using TRL.Common.Data;
using TRL.Common.Extensions.Data;
using TRL.Common.Models;
using TRL.Common.Handlers;
using TRL.Common.Collections;
using TRL.Common.TimeHelpers;
//using TRL.Connect.Smartcom;
//using TRL.Connect.Smartcom.Commands;
using TRL.Connect.Smartcom.Data;
using TRL.Transaction;
//using TRL.Connect.Smartcom.Handlers;
//using TRL.Handlers.Spreads;
//using TRL.Handlers.StopLoss;
//using TRL.Handlers.TakeProfit;
//using TRL.Handlers.Inputs;
using TRx.Handlers;
using TRx.Helpers;
using TRx.Base;
using TRL.Connect.Smartcom.Commands;

//using TRL.Common.Statistics;

namespace TRx.Strategy
{
    /// <summary>
    /// пример вычисления пересечения скользящих средних
    /// </summary>
    public class Sample2 : ISetupStrategy
    {
        #region // базовые сущности
        public  StrategyHeader strategyHeader { get; set; }
        public  BarSettings barSettings { get; set; }

        /// <summary>
        /// отправляем Bar клиентам 
        /// </summary>
        public  SendItemOnBar sendItemBar { get; set; }
        ///    = new SendItemOnBar(barSettings, TradingData.Instance);
        #endregion //

        private  MakeRangeBarsOnTick updateBarsHandler { get; set; }
        private  IndicatorOnBar2Ma indicatorsOnBar { get; set; }
        private ReversMaOnBar reversHandler { get; set; }

        public Sample2(string[] args)
        {
            Initialize();
            SetupStrategy(args);
        }

        #region // методы стратегии
        public void Initialize()
        {
            Console.WriteLine("Strategy.Sample2.Initialize()");

            strategyHeader = new StrategyHeader(1, "Strategy Sample2",
                AppSettings.GetStringValue("Portfolio"),
                AppSettings.GetStringValue("Symbol"),
                AppSettings.GetValue<double>("Amount"));
            barSettings = new BarSettings(strategyHeader,
                        strategyHeader.Symbol,
                        AppSettings.GetValue<int>("Interval"),
                        AppSettings.GetValue<int>("Period"));
            
            //Отправляем данные клиентам
            {
                /// отправляем Bar клиентам 
                sendItemBar = new SendItemOnBar(barSettings, TradingData.Instance);
                sendItemBar.AddItemHandler(TradeConsole.ConsoleWriteLineBar);
                if (AppSettings.GetValue<bool>("SignalHub"))
                {
                    //отправляем через signalR
                    sendItemBar.AddItemHandler(TradeHubStarter.sendBar);
                }
            }

            //private static ProfitPointsSettings ppSettings =
            //    new ProfitPointsSettings(strategyHeader, AppSettings.GetValue<double>("ProfitPoints"), false);

            //private static TakeProfitOrderSettings poSettings =
            //    new TakeProfitOrderSettings(strategyHeader, 86400);

            //private static StopPointsSettings spSettings =
 