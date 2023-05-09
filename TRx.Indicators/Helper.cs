using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Globalization;

namespace TRx.Indicators
{
    /// <summary>
    /// Вспомогательный класс, содержащий хелпер методы. В том числе и методы расширения.
    /// </summary>
    public static class Helper
    {
        #region Общие хелперы
        /// <summary>
        /// Метод упрощающий форматирование строк.
        /// </summary>
        /// <param name="str">Строка для форматирования.</param>
        /// <param name="args">Аргументы для форматирования.</param>
        /// <returns></returns>
        public static string Put(this string str, params object[] args)
        {
            // Вводим культуру для того чтобы double числа не переводились как числа с запятой! Это гадит.
            return string.Format(CultureInfo.InvariantCulture, str, args);
        }
        #endregion


        /// <summary>
        /// Дает расчет параболического стопа для позиции. Расчет идет по формуле 
        /// y = a*x^2 + b*x + c, где x - число бар удержания позы.
        /// </summary>
        /// <param name="posEntryBarNum">x = barNumber - posEntryBarNum</param>
        /// <param name="barNumber">x = barNumber - posEntryBarNum</param>
        /// <param name="posIsLong">Направление параболы по y</param>
        /// <param name="a">Коэффициент меняющий вид параболы. Положительное число.</param>
        /// <param name="posEntryPrice">c = posEntryPrice +(-) StopDelta</param>
        /// <param name="StopDelta">c = posEntryPrice +(-) StopDelta</param>
        /// <returns>StopPrice</returns>
        public static double StopParabola(  int posEntryBarNum,
                                            int barNumber,
                                            bool posIsLong,
                                            double a,
                                            double posEntryPrice,
                                            double StopDelta
                                            )
        {
            if (barNumber < posEntryBarNum)
                throw new ArgumentOutOfRangeException("barNumber", "номер бара должен быть больше чем бар открытия позиции.");

            if (StopDelta < 0)
                throw new ArgumentOutOfRangeException("StopDelta", "delta должен быть положительным числом или 0.");

            if (a <= 0)
       