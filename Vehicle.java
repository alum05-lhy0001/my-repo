// this program creates two vehicle objects
public class Vehicle {
    int passengers; // number of passengers
    int fuelcap;    // fuel capacity in gallons
    int mpg;        // fuel consumption in miles per gallon
    // main moved to top-level class below
    int range() {
        return fuelcap * mpg;
    }

    // this method calculates fuel needed for a given distance
    double fuelneeded(int miles) {
        return (double) miles / mpg;
    }
    
}

class TwoVehicles {
    public static void main(String[] args) {
        Vehicle minivan = new Vehicle();
        Vehicle sportscar = new Vehicle();

        int range1, range2;

        // assign values to minivan fields
        minivan.passengers = 7;
        minivan.fuelcap = 16;
        minivan.mpg = 21;

        // assign values to sportscar fields
        sportscar.passengers = 2;
        sportscar.fuelcap = 14;
        sportscar.mpg = 12;

        // compute the range assuming a full tank of gas
        range1 = minivan.fuelcap * minivan.mpg;
        range2 = sportscar.fuelcap * sportscar.mpg;

        System.out.println("Minivan can carry " + minivan.passengers +
                " passengers for a range of " + range1 );
        System.out.println("Sportscar can carry " + sportscar.passengers +
                " passengers for a range of " + range2 );
    }
}
