import React, { useState } from "react";
import styled from "styled-components/macro";
import * as _ from "lodash";
import { EditLogin } from "./EditLogin";
import { SimpleCard } from "./Card";
import { Btn } from "./Button";
import { Icon } from "./Icon";
import { LoadingSpinner } from "./Loading";

const ConfirmDeleteBtns = styled.div`
  margin-top: 15px;
  display: flex;

  & > button:first-child {
    margin-right: 20px;
  }
`;

const ConfirmDeleteWrap = styled(SimpleCard)`
  padding: 30px 22px;
  line-height: 1.53;
  text-align: center;

  & > h2 {
    font-size: 20px;
    font-weight: normal;
    color: #555a60;

    & > strong {
      font-weight: 600;
    }
  }

  & > p {
    color: #696d74;
    font-size: 16px;
  }
`;

export const ConfirmDelete: React.FC<{
  onDelete: () => Promise<any>;
  onBack: () => any;
  title: React.ReactElement;
  body: React.ReactElement;
  deleteButtonText: string;
}> = (props) => {
  const [submitting, setSubmitting] = useState(false);

  return (
    <ConfirmDeleteWrap>
      <h2>⚠️ {props.title}</h2>
      <p>{props.body}</p>

      <ConfirmDeleteBtns>
        <Btn
          variant="blue"
          disabled={submitting}
          size={51.5}
          onClick={props.onBack}
        >
          <Icon kind="back" />{" "}
        </Btn>
        <Btn
          block
          variant="red"
          fontSize={20}
          onClick={async (event) => {
            event.preventDefault();
            if (submitting) return;
            setSubmitting(true);
            await props.onDelete();
            setSubmitting(false);
          }}
        >
          {submitting ? <LoadingSpinner /> : props.deleteButtonText}
        </Btn>
      </ConfirmDeleteBtns>
    </ConfirmDeleteWrap>
  );
};
