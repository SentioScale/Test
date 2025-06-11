import datetime

class Mesa:
    def __init__(self, mesa_id, sillas):
        self.mesa_id = mesa_id
        self.sillas = sillas
        self.reservas = []  # lista de (inicio, fin)

    def disponible(self, inicio, fin):
        for (i, f) in self.reservas:
            if inicio < f and fin > i:
                return False
        return True

    def reservar(self, inicio, fin):
        if self.disponible(inicio, fin):
            self.reservas.append((inicio, fin))
            return True
        return False

    def liberar(self, momento):
        self.reservas = [
            (i, f) for (i, f) in self.reservas
            if not (i <= momento < f)
        ]

    def __str__(self):
        res = ", ".join(
            f"{i.strftime('%H:%M')}-{f.strftime('%H:%M')}" for (i, f) in self.reservas
        )
        if not res:
            res = "Libre"
        return f"Mesa {self.mesa_id} ({self.sillas} sillas): {res}"


def pedir_hora(mensaje):
    while True:
        try:
            valor = input(mensaje)
            return datetime.datetime.strptime(valor, "%H:%M")
        except ValueError:
            print("Formato incorrecto. Use HH:MM")


def main():
    n = int(input("Cantidad de mesas: "))
    mesas = []
    for i in range(1, n + 1):
        sillas = int(input(f"Sillas para la mesa {i}: "))
        mesas.append(Mesa(i, sillas))

    while True:
        print("\nOpciones:")
        print("1. Reservar mesa")
        print("2. Liberar mesa")
        print("3. Ver estado")
        print("4. Salir")
        opcion = input("Seleccione una opcion: ")

        if opcion == "1":
            mesa_id = int(input("Mesa a reservar: "))
            if 1 <= mesa_id <= n:
                inicio = pedir_hora("Hora inicio (HH:MM): ")
                fin = pedir_hora("Hora fin (HH:MM): ")
                if fin <= inicio:
                    print("La hora de fin debe ser posterior al inicio")
                    continue
                if mesas[mesa_id - 1].reservar(inicio, fin):
                    print("Reserva realizada")
                else:
                    print("No disponible en ese horario")
            else:
                print("Mesa inexistente")

        elif opcion == "2":
            mesa_id = int(input("Mesa a liberar: "))
            if 1 <= mesa_id <= n:
                momento = pedir_hora("Hora en la que se libera (HH:MM): ")
                mesas[mesa_id - 1].liberar(momento)
                print("Mesa liberada")
            else:
                print("Mesa inexistente")

        elif opcion == "3":
            for m in mesas:
                print(m)
        elif opcion == "4":
            break
        else:
            print("Opcion no valida")

if __name__ == "__main__":
    main()
