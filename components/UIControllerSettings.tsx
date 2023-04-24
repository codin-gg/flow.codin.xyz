import {
  refreshModels,
  update,
  updateSettingsForm,
} from "@/stores/ChatActions";
import { useChatStore } from "@/stores/ChatStore";
import { getModelInfo } from "@/stores/Model";
import { Button, Menu, px } from "@mantine/core";
import { IconCheck, IconDotsVertical } from "@tabler/icons-react";
import React, { useEffect } from "react";

function MenuItem({
  item,
}: {
  item: { text: string; checked: boolean; onClick?: () => void };
}) {
  return (
    <Menu.Item
      onClick={item.onClick}
      icon={
        <IconCheck
          style={{
            visibility: item.checked ? "visible" : "hidden",
          }}
          size={14}
        />
      }
    >
      {item.text}
    </Menu.Item>
  );
}

export default function UIController() {
  const modelChoicesChat = useChatStore((state) => state.modelChoicesChat) || [];
  const settingsForm = useChatStore((state) => state.settingsForm);

  useEffect(() => {
    refreshModels();
  }, []);

  // Filter out models that end with a date eg. gpt-3-1234
  const primaryModels = modelChoicesChat.filter(
    (model) => !model.match(/-\d{4}$/)
  );
  const menuStructure = [
    {
      label: "Chat",
      items: primaryModels.map((model) => ({
        text: getModelInfo(model).displayName,
        checked: settingsForm.model === model,
        onClick: () =>
          updateSettingsForm({
            ...settingsForm,
            model,
          }),
      })),
    },
  ];

  return (
    <Menu withArrow closeOnItemClick={false}>
      <Menu.Target>
        <Button
          sx={{ height: 36, borderRadius: "0px 8px 0px 0px" }}
          compact
          variant="light"
        >
          <IconDotsVertical size={px("1.1rem")} stroke={1.5} />
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {menuStructure.map((section) => (
          <React.Fragment key={section.label}>
            <Menu.Label>{section.label}</Menu.Label>
            {section.items.map((item) => (
              <MenuItem key={item.text} item={item} />
            ))}
          </React.Fragment>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
