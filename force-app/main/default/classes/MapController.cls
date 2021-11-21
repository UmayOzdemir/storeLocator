public with sharing class MapController {
    @AuraEnabled (cacheable=true)
    public static List<Account> getStoreLocations(){
        try{
            return [SELECT Id, Name, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry,Store_Type__c, Latitude__c, Longitude__c
            FROM Account
            WHERE (BillingCity != null or BillingPostalCode != null or BillingCountry != null or BillingState != null or BillingStreet != null)  
            AND Store__c = true]; 
            //At least one of these fields needs to filled for Google Map 
            //Limit for geolocations is 10  
        }catch(Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String deleteSelectedStore(String accountId){
		try{
            Account selectedStore;
            selectedStore = [SELECT Id 
                            FROM Account
                            WHERE Id = :accountId];

            delete selectedStore;
            
            return 'Store deleted successfully';
        }catch(Exception e){
            throw new AuraHandledException(e.getMessage());
        }
        
    }

    @AuraEnabled
    public static String updateSelectedStore(String accountId, String name, String street, String city, String state, String postalCode, String country, String storeType){
        try {
            Account store = [SELECT Id,  Name, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry,Store_Type__c 
                             FROM Account
                             WHERE Id = :accountId];
            store.Name = name;
            store.BillingCity = city;
            store.BillingState = state;
            store.BillingPostalCode = postalCode;
            store.BillingCountry = country;
            store.BillingStreet = street;
            store.Store_Type__c = storeType;

            update store;
            
            return 'Store details updated successfully';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


}
