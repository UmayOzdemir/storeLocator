@IsTest
public class TestDataFactory {
    public static List<Account> createStores(String Name,String BillingStreet,String BillingCity, String BillingState, String BillingPostalCode, String BillingCountry, String StoreTypes, Integer numberOfRecords) {
        List<Account> stores = new List<Account>();
        for(Integer i=0;i<numberOfRecords;i++) {
            Account a = new Account(
                        Name = Name + i,
                        BillingStreet = BillingStreet,
                        BillingCity = BillingCity,
                        BillingState = BillingState,
                        BillingPostalCode = BillingPostalCode,
                        BillingCountry = BillingCountry,
                        Store_Type__c = StoreTypes,
                        Store__c = true);
            stores.add(a);
        }
        insert stores;

        return stores;
    }
}
