public class GeoCode {
    @future(callout=true)
    public static void parseJSONResponse(String aid, String street, String city, String state, String postalCode, String country) {  
		String lat;
        String lng;
        Integer latCnt = 0;
        Integer lonCnt = 0;
        String address=street.replaceAll(' ', '+')+','+city+','+state+','+postalCode+','+country ;
        String key='AIzaSyAchoZtcDA0OE_sc6QM7PxhCWId0aQilRU';
        Account store;
        Http httpProtocol = new Http();
        // Create HTTP request to send.
        HttpRequest request = new HttpRequest();
        // Set the endpoint URL.
        String endpoint = 'https://maps.googleapis.com/maps/api/geocode/json?address='+address+'&key='+key;
        request.setEndPoint(endpoint);
        // Set the HTTP verb to GET.
        request.setMethod('GET');
        // Send the HTTP request and get the response.
        // The response is in JSON format.
        HttpResponse response = httpProtocol.send(request);
		JSONParser parser = JSON.createParser(response.getBody());

	    while (parser.nextToken() != null) {
            if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                (parser.getText() == 'lat')) {
                // Get the value.
                    parser.nextToken();
                    if (latCnt != 3) { //location is the third object that contains lat and lon
                        lat = parser.getText();
                        latCnt++;
                    }
            }
            if ((parser.getCurrentToken() == JSONToken.FIELD_NAME) && 
                (parser.getText() == 'lng')){
                    parser.nextToken();
                    if (lonCnt != 3) {
                        lng = parser.getText();
                        lonCnt++;
                    }
            }
        }
        
        store = [SELECT Id, Latitude__c, Longitude__c FROM Account WHERE Id = :aid ];
        store.Latitude__c = lat;
        store.Longitude__c = lng;
        update store; 
        
    }   
}