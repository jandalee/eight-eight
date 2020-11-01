using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TRL.Common;
using TRL.Common.Collections;
using TRL.Common.Data;
using TRL.Common.Extensions.Data;
//using TRL.Common.Extensions;
using TRL.Common.Handlers;
using TRL.Common.Models;
using TRL.Logging;
using TRL.Common.TimeHelpers;

namespace TRL.Common.Handlers
{
    public class MarkPartiallyFilledOrderAsOutdatedOnTick:AddedItemHandler<Tick>
    {
        private StrategyHeader strategyHeader;
        private int outdateSeconds;
        private ILogger logger;
        private IDataContext tradingData;

        public MarkPartiallyFilledOrderAsOutdatedOnTick(StrategyHeader strategyHeader, int outdateSeconds, IDataContext tradingData, ILogger logger)
            :base(tradingData.Get<ObservableCollection<Tick>>())
        {
            this.strategyHeader = strategyHeader;
            this.outdateSeconds = outdateSeconds;
            this.tradingData = tradingData;
            this.logger = logger;
        }

        public override void OnItemAdded(Tick item)
        