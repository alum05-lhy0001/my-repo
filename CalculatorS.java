import java.util.Scanner;

// Simple calculator using switch (supports words and symbols)
public class CalculatorS {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Calculator (type Q to quit)");
        System.out.println("Enter operations as: <number1> <operator> <number2>");
        System.out.println("Operators: +, -, *, /  or words: add, subtract, multiply, divide");

        while (true) {
            System.out.print("> ");
            if (!sc.hasNext()) break;
            String token = sc.next();

            if (token.equalsIgnoreCase("Q")) {
                System.out.println("Goodbye.");
                break;
            }

            // first token should be a number
            double a;
            try {
                a = Double.parseDouble(token);
            } catch (NumberFormatException e) {
                System.out.println("Invalid first number. Try again.");
                // consume rest of line to avoid infinite loop if broken input
                continue;
            }

            if (!sc.hasNext()) {
                System.out.println("Missing operator and second number. Try again.");
                break;
            }
            String op = sc.next();

            if (op.equalsIgnoreCase("Q")) {
                System.out.println("Goodbye.");
                break;
            }

            if (!sc.hasNext()) {
                System.out.println("Missing second number. Try again.");
                continue;
            }
            String btok = sc.next();
            double b;
            try {
                b = Double.parseDouble(btok);
            } catch (NumberFormatException e) {
                System.out.println("Invalid second number. Try again.");
                continue;
            }

            String mop = op.toLowerCase();
            double result;
            boolean ok = true;

            switch (mop) {
                case "+":
                case "add":
                    result = a + b;
                    break;
                case "-":
                case "subtract":
                case "sub":
                    result = a - b;
                    break;
                case "*":
                case "x":
                case "multiply":
                case "mul":
                    result = a * b;
                    break;
                case "/":
                case "divide":
                case "div":
                    if (b == 0.0) {
                        System.out.println("Error: Division by zero.");
                        ok = false;
                        result = Double.NaN;
                    } else {
                        result = a / b;
                    }
                    break;
                default:
                    System.out.println("Unknown operator: '" + op + "'. Use + - * / or words add/subtract/multiply/divide.");
                    ok = false;
                    result = Double.NaN;
            }

            if (ok) {
                // print as integer when it is whole, otherwise as double
                if (result == Math.rint(result)) {
                    System.out.println("Result = " + (long) result);
                } else {
                    System.out.println("Result = " + result);
                }
            }
        }

        sc.close();
    }
}
