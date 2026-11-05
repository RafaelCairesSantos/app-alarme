import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "./axios";

const HomeScreen = () => {
  // Estado atual do alarme
  const [alarmeAtivo, setAlarmeAtivo] = useState(false);

  // Última distância conhecida
  const [distancia, setDistancia] = useState(0);

  // Limite de segurança e intrusão
  const [limite, setLimite] = useState(15);
  const [intrusao, setIntrusao] = useState(false);

  const navigation = useNavigation();

  // ------------------------------------------------
  // CAMERA
  // ------------------------------------------------
  const handleCam = () => {
    navigation.navigate("Cam");
  };

  // ------------------------------------------------
  // CONSULTAR ADAFRUIT IO
  // ------------------------------------------------
  async function atualizarDados() {
    try {
      // Consulta estado do alarme
      const respostaAlarme = await api.getAlarme();
      const valorAlarme = String(respostaAlarme.data.value)
        .trim()
        .toLowerCase();
      setAlarmeAtivo(valorAlarme === "true");
    } catch (error) {
      console.log("Erro ao consultar alarme:", error.message);
    }

    try {
      // Consulta distância
      const respostaDistancia = await api.getDistancia();
      const valorDistancia = Number(respostaDistancia.data.value);
      if (Number.isFinite(valorDistancia)) {
        setDistancia(valorDistancia);
      }
    } catch (error) {
      console.log("Erro ao consultar distância:", error.message);
    }

    try {
      // Consulta limite
      const respostaLimite = await api.getLimite();
      const valorLimite = Number(respostaLimite.data.value);
      if (Number.isFinite(valorLimite)) {
        setLimite(valorLimite);
      }
    } catch (error) {
      console.log("Erro ao consultar limite:", error.message);
    }

    try {
      // Consulta situação de intrusão
      const respostaIntrusao = await api.getIntrusao();
      const valorIntrusao = String(respostaIntrusao.data.value)
        .trim()
        .toLowerCase();
      setIntrusao(valorIntrusao === "true");
    } catch (error) {
      console.log("Erro ao consultar intrusão:", error.message);
    }
  }

  // ------------------------------------------------
  // POLLING
  // ------------------------------------------------
  useEffect(() => {
    atualizarDados();

    const intervalo = setInterval(atualizarDados, 3000);

    return () => {
      clearInterval(intervalo);
    };
  }, []);

  // ------------------------------------------------
  // ARMAR / DESARMAR
  // ------------------------------------------------
  async function alternarAlarme() {
    try {
      const novoEstado = !alarmeAtivo;
      await api.setAlarme(novoEstado);
      setAlarmeAtivo(novoEstado);
    } catch (error) {
      console.log("Erro ao alterar alarme:", error.message);
    }
  }

  // ------------------------------------------------
  // ALTERAR LIMITE
  // ------------------------------------------------
  async function mudarLimite(novoLimite) {
    try {
      await api.setLimite(novoLimite);
      setLimite(novoLimite);
    } catch (error) {
      console.log("Erro ao alterar limite:", error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>SISTEMA DE ALARME</Text>

      <Text
        style={[
          styles.statusAlarme,
          { color: alarmeAtivo ? "#d9534f" : "#5cb85c" },
        ]}
      >
        {alarmeAtivo ? "ALARME ARMADO" : "ALARME DESARMADO"}
      </Text>

      <Text style={styles.infoTexto}>Distância atual: {distancia} cm</Text>

      <Text style={styles.infoTexto}>Limite de segurança: {limite} cm</Text>

      {intrusao ? (
        <Text style={styles.intrusaoDetectada}>INTRUSÃO DETECTADA!</Text>
      ) : (
        <Text style={styles.ambienteSeguro}>AMBIENTE SEGURO</Text>
      )}

      <View style={styles.secaoLimite}>
        <Text style={styles.subtituloLimite}>Alterar limite:</Text>
        <View style={styles.botoesLimite}>
          <View style={styles.botaoWrapper}>
            <Button title="Limite 10 cm" onPress={() => mudarLimite(10)} />
          </View>
          <View style={styles.botaoWrapper}>
            <Button title="Limite 20 cm" onPress={() => mudarLimite(20)} />
          </View>
          <View style={styles.botaoWrapper}>
            <Button title="Limite 30 cm" onPress={() => mudarLimite(30)} />
          </View>
        </View>
      </View>

      <View style={styles.acaoWrapper}>
        <Button
          title={alarmeAtivo ? "Desarmar Alarme" : "Armar Alarme"}
          onPress={alternarAlarme}
          color={alarmeAtivo ? "red" : "green"}
        />
      </View>

      <View style={styles.acaoWrapper}>
        <Button title="Abrir Câmera" onPress={handleCam} color="blue" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  statusAlarme: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoTexto: {
    fontSize: 18,
    marginBottom: 10,
  },
  intrusaoDetectada: {
    color: "red",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
    textAlign: "center",
  },
  ambienteSeguro: {
    color: "green",
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 16,
    textAlign: "center",
  },
  secaoLimite: {
    marginVertical: 14,
    alignItems: "center",
  },
  subtituloLimite: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  botoesLimite: {
    flexDirection: "row",
    gap: 8,
  },
  botaoWrapper: {
    marginHorizontal: 3,
  },
  acaoWrapper: {
    width: "100%",
    maxWidth: 240,
    marginTop: 12,
  },
});

export default HomeScreen;
