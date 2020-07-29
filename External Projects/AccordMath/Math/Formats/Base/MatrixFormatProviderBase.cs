// Accord Math Library
// The Accord.NET Framework
// http://accord-net.origo.ethz.ch
//
// Copyright © César Souza, 2009-2011
// cesarsouza at gmail.com
// http://www.crsouza.com
//

using System;
using System.Globalization;

namespace Accord.Math.Formats
{
    /// <summary>
    ///   Base class for IMatrixFormatProvider implementors.
    /// </summary>
    /// 
    public abstract class MatrixFormatProviderBase : IMatrixFormatProvider
    {
        #region Formatting specification

        /// <summary>
        /// A string denoting the start of the matrix to be used in formatting.
        /// </summary>
        public string FormatMatrixStart { get; protected set; }

        /// <summary>
        /// A string denoting the end of the matrix to be used in formatting.
        /// </summary>
        public string FormatMatrixEnd { get; protected set; }

        /// <summary>
        /// A string denoting the start of a matrix row to be used in formatting.
        /// </summary>
        public string FormatRowStart { get; protected set; }

        /// <summary>
        /// A string denoting the end of a matrix row to be used in formatting.
        /// </summary>
        public string FormatRowEnd { get; protected set; }

        /// <summary>
        /// A string denoting the start of a matrix column to be used in formatting.
        /// </summary>
        public string FormatColStart { get; protected set; }

        /// <summary>
        /// A string denoting the end of a matrix column to be used in formatting.
        /// </summary>
        public string FormatColEnd { get; protected set; }

        /// <summary>
        /// A string containing the row delimiter for a matrix to be used in formatting.
        /// </summary>
        public string FormatRowDelimiter { get; protected set; }

        /// <summary>
        /// A string containing the column delimiter for a matrix to be used in formatting.
        /// </summary>
        public string FormatColDelimiter { get; protected set; }

        #endregion

        #region Parsing specification

        /// <summary>
        /// A string denoting the start of the matrix to be used in parsing.
        /// </summary>
        public string ParseMatrixStart { get; protected set; }

        /// <summary>
        /// A string denoting the end of the matrix to be used in parsing.
        /// </summary>
        public string ParseMatrixEnd { get; protected set; }

        /// <summary>
        /// A string denoting the start of a matrix row to be used in parsing.
        /// </summary>
        public string ParseRowStart { get; protected set; }

        /// <summary>
        /// A string denoting the end of a matrix row to be used in parsing.
        /// </summary>
        public string ParseRowEnd { get; protected set; }

        /// <summary>
        /// A string denoting the start of a matrix column to be used in parsing.
        /// </summary>
        public string ParseColStart { get; protected set; }

        /// <summary>
        /// A string denoting the end of a matrix column to be used in parsing.
        /// </summary>
        public string ParseColEnd { get; protected set; }

        /// <summary>
        /// A string containing the row delimiter for a matrix to be used in parsing.
        /// </summary>
        public string ParseRowDelimiter { get; protected set; }

        /// <summary>
        /// A string containing the column delimiter for a matrix to be used in parsing.
        /// </