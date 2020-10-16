using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TRL.Common.Models;

namespace TRL.Common.Extensions.Collections
{
    public static class TradeCollectionExtensions
    {
        /// <summary>
        /// Получить частичную копию исходной коллекции сделок с указанным суммарным объемом (Amount).
        /// </summary>
        /// <param name="srcCollection">Ссылка на исходную коллекцию сделок.</param>
        /// <param name="amount">Суммарный объем всех сделок в частичной копии исходной коллекции.</param>
        /// <returns>Метод возвращает копию исходной коллекции, в которой для уменьшения объема 
        /// могут быть отброшены самые новые сделки, объем которых превышает запрашиваемый.</returns>
        public static IEnumerable<Trade> TakeForAmount(this IEnumerable<Trade> srcCollection, double amount)
        {
            List<Trade> dstCollection = new List<Trade>();
            
            double dstCollectionAmountSum = 0;

            foreach (Trade currentTrade in srcCollection)
            {
                if (dstCollectionAmountSum == amount)
                    return dstCollection;

                if (dstCollectionAmountSum + Math.Abs(currentTrade.Amount) <= amount)
                {
                    dstCollection.Add(currentTrade);
                    dstCollectionAmountSum += Math.Abs(currentTrade.Amount);
                }
                else
                {
                    double wantage = amount - dstCollectionAmountSum;
                    dstCollection.Add(CloneT