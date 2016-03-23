'use strict';

angular.module('WebExApp').service('WebExApiGatewayConstsService', [
  function () {
    this.csvJobTypes = {
      typeNone: 0,
      typeImport: 1,
      typeExport: 2
    };

    this.csvJobStatus = {
      statusQueued: 0,
      statusPreProcess: 1,
      statusCompleted: 2,
      statusInProcess: 3
    };

    this.csvStates = {
      none: 'none',
      exportInProgress: 'exportInProgress',
      exportCompletedNoErr: 'exportCompletedNoErr',
      exportCompletedWithErr: 'exportCompletedWithErr',
      importInProgress: 'importInProgress',
      importCompletedNoErr: 'importCompletedNoErr',
      importCompletedWithErr: 'importCompletedWithErr'
    };

    this.csvStatusTypes = [
      this.csvStates.none,
      this.csvStates.exportInProgress,
      this.csvStates.exportCompletedNoErr,
      this.csvStates.exportCompletedWithErr,
      this.csvStates.importInProgress,
      this.csvStates.importCompletedNoErr,
      this.csvStates.importCompletedWithErr,
    ]; // csvStatusTypes[]
  } // end top level function
]); // service
