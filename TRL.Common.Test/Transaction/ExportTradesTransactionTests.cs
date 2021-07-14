using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Data;
using TRL.Common.Models;
using TRL.Common;
using System.IO;
using TRL.Common.Collections;
using TRL.Common.Test;
using TRL.Common.TimeHelpers;

namespace TRL.Transaction.Test
{
    [TestClass]
    public class ExportTradesTransactionTests
    {
        private IDataContext tradingData;
        private string path;

        [TestInitialize]
        public void Transaction_Setup()
        {
            this.tradingData = new TradingDataContext();
            this.path = String.Concat(ProjectRootFolderNameFactory.Make(), "\\export-trades.txt");
        }

        [TestCleanup]
        public void Transaction_TearDown()
        {
            if (File.Exists(this.path))
                File.Delete(this.path);
        }

        [TestMethod]
        public void Transaction_ExportTradesTransaction_test()
        {
            StrategyHeader st1 = new StrategyHeader(1, "First strategyHeader", "BP12345-RF-01", "RTS-9.13_FT", 10);
            this.tradingData.Get<ICollection<StrategyHeader>>().Add(st1);

            StrategyHeader st2 = new StrategyHeader(2, "Second strategyHeader", "BP12345-RF-01", "RTS-9.13_FT", 8);
            this.tradingData.Get<ICollection<StrategyHeader>>().Add(st2);

            StrategyHeader st3 = new StrategyHeader(3, "Third strategyHeader", "BP12345-RF-01", "RTS-