import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  question: string;
  choices: { [key: string]: string };
  onSelect: (key: string) => void;
}

const QuestionBox: React.FC<Props> = ({ question, choices, onSelect }) => {
  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 10, padding: 16 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>
        {question}
      </Text>
      {Object.entries(choices).map(([key, value]) => (
        <TouchableOpacity
          key={key}
          onPress={() => onSelect(key)}
          style={{
            backgroundColor: "#eee",
            padding: 10,
            borderRadius: 6,
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 16 }}>{`${key}: ${value}`}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default QuestionBox;
