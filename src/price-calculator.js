class PriceCalculator {
    constructor() {
        this.baseRate = 50; // Base charge
        this.perKmRate = 8; // Per km rate
        this.weightCharges = {
            '0-5': 0,
            '5-10': 50,
            '10-20': 100,
            '20+': 200
        };
    }

    async calculatePrice(pickupPincode, deliveryPincode, weight) {
        try {
            // Get distance using Google Distance Matrix API
            const distance = await this.getDistance(pickupPincode, deliveryPincode);

            if (distance === null) {
                return null;
            }

            // Calculate base price
            let price = this.baseRate + (distance * this.perKmRate);

            // Add weight charges
            price += this.getWeightCharge(weight);

            // Add GST (18%)
            const gst = price * 0.18;
            const total = price + gst;

            return {
                basePrice: price.toFixed(2),
                gst: gst.toFixed(2),
                total: total.toFixed(2),
                distance: distance.toFixed(2)
            };
        } catch (error) {
            console.error('Price calculation error:', error);
            return null;
        }
    }

    async getDistance(origin, destination) {
        try {
            const directionsService = new google.maps.DirectionsService();

            return new Promise((resolve, reject) => {
                const request = {
                    origin: origin,
                    destination: destination,
                    travelMode: google.maps.TravelMode.DRIVING
                };

                directionsService.route(request, function(result, status) {
                    if (status == 'OK') {
                        const route = result.routes[0].legs[0];
                        resolve(route.distance.value / 1000); // Convert to km
                    } else {
                        console.error('Directions Service failed with status:', status);
                        reject('Distance calculation failed. Please check the PIN codes.');
                    }
                });
            });
        } catch (error) {
            console.error("Google Maps API failed, using fallback calculation:", error);
            const pincode1 = parseInt(origin, 10);
            const pincode2 = parseInt(destination, 10);
            const diff = Math.abs(pincode1 - pincode2);
            // This is a very rough estimation. A better approach would be to use a database of pincode locations.
            const distance = diff / 100; 
            return Promise.resolve(distance);
        }
    }

    getWeightCharge(weight) {
        if (weight <= 5) return this.weightCharges['0-5'];
        if (weight <= 10) return this.weightCharges['5-10'];
        if (weight <= 20) return this.weightCharges['10-20'];
        return this.weightCharges['20+'];
    }
}