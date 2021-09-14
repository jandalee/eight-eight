using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TRL.Common.Models;
using TRL.Common.Data;
using TRL.Common;

namespace TRL.Configuration
{
    public class TakeProfitOrderSettingsFactory:IGenericFactory<TakeProfitOrderSettings>
    {
        private StrategyHeader strategyHeader;
        private string prefix;

        public TakeProfitOrderSettingsFactory(StrategyHeader strategyHeader, string prefix)
        {
            this.strategyHeader = strategyHeader;
            thi