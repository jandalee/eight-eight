using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Globalization;

namespace TRL.Common.Models
{
    /// <summary>
    /// Стратегия
    /// </summary>
    public class StrategyHeader:IIdentified
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public string Portfolio { get; set; }
        public string Symbol { get; set; }
        public double Amount { get; set; }

        public StrategyHeader(int id, string description, string portfolio, string symbol, double amount)
        {
            this.Id = id;
            this.Description = description;
            this.Portfol