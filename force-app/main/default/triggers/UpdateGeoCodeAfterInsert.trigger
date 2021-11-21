trigger UpdateGeoCodeAfterInsert on Account (after insert) {
    for(Account a : Trigger.New){
        GeoCode.parseJSONResponse(a.Id, a.BillingStreet, a.BillingCity, a.BillingState,a.BillingPostalCode,a.BillingCountry);
    }
}