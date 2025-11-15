import java.util.Scanner;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;

public class Max_List {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter numbers one by one. Enter 'M' to output statistics (max,min,sum,count,average,variance,stddev,mode), or 'N' to output the minimum and exit.");

        double max = Double.NEGATIVE_INFINITY;
        double min = Double.POSITIVE_INFINITY;
        boolean haveNumber = false;

        long count = 0;
        double sum = 0.0;
        double mean = 0.0; // for Welford
        double m2 = 0.0;   // for Welford
        Map<Double, Integer> freq = new HashMap<>();

        while (true) {
            System.out.print("> ");
            if (!sc.hasNext()) { // EOF
                System.out.println("No more input. Exiting.");
                break;
            }
            String token = sc.next();

            if (token.equalsIgnoreCase("M")) {
                if (haveNumber) {
                    double average = mean;
                    double variance = (count > 0) ? (m2 / count) : 0.0; // population variance
                    double stddev = Math.sqrt(variance);

                    System.out.println("Maximum = " + fmt(max));
                    System.out.println("Minimum = " + fmt(min));
                    System.out.println("Sum = " + fmt(sum));
                    System.out.println("Count = " + count);
                    System.out.println("Average = " + fmt(average));
                    System.out.println("Variance (population) = " + fmt(variance));
                    System.out.println("Standard deviation (population) = " + fmt(stddev));

                    // mode(s)
                    int best = 0;
                    List<Double> modes = new ArrayList<>();
                    for (Map.Entry<Double, Integer> e : freq.entrySet()) {
                        int f = e.getValue();
                        if (f > best) {
                            best = f;
                            modes.clear();
                            modes.add(e.getKey());
                        } else if (f == best) {
                            modes.add(e.getKey());
                        }
                    }
                    if (best <= 1) {
                        System.out.println("Mode: none (all values are unique)");
                    } else {
                        System.out.print("Mode(s) (frequency=" + best + "): ");
                        for (int i = 0; i < modes.size(); i++) {
                            System.out.print(fmt(modes.get(i)));
                            if (i < modes.size() - 1) System.out.print(", ");
                        }
                        System.out.println();
                    }
                } else {
                    System.out.println("No numbers were entered.");
                }
                break;
            }

            if (token.equalsIgnoreCase("N")) {
                if (haveNumber) {
                    System.out.println("Minimum = " + fmt(min));
                } else {
                    System.out.println("No numbers were entered.");
                }
                break;
            }

            try {
                double val = Double.parseDouble(token);
                if (!haveNumber) {
                    max = min = val;
                    haveNumber = true;
                } else {
                    if (val > max) max = val;
                    if (val < min) min = val;
                }

                // update counters and Welford for variance
                count++;
                sum += val;
                double delta = val - mean;
                mean += delta / count;
                m2 += delta * (val - mean);

                // frequency for mode
                freq.put(val, freq.getOrDefault(val, 0) + 1);

            } catch (NumberFormatException e) {
                System.out.println("Invalid input. Enter a number, or 'M'/'N' to finish.");
            }
        }

        sc.close();
    }

    private static String fmt(double d) {
        if (Double.isInfinite(d) || Double.isNaN(d)) return Double.toString(d);
        // show up to 6 decimal places but trim trailing zeros
        String s = String.format("%.6f", d);
        if (s.indexOf('.') >= 0) {
            while (s.endsWith("0")) {
                s = s.substring(0, s.length() - 1);
            }
            if (s.endsWith(".")) s = s.substring(0, s.length() - 1);
        }
        return s;
    }
}
